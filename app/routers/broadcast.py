from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import Broadcast
from app.config import settings
import httpx
import json

router = APIRouter()

class BroadcastCreate(BaseModel):
    content: str
    channel_ids: list[int]

@router.post("/{guild_id}/broadcast")
async def create_broadcast(guild_id: int, content: str = Form(), channel_ids: str = Form(), media: UploadFile = File(None), db: AsyncSession = Depends(get_db)):
    import os
    channel_list = [int(x) for x in channel_ids.split(",")]
    media_path = None
    
    # Save media if provided
    if media:
        guild_dir = os.path.join(settings.media_dir, f"guild_{guild_id}")
        os.makedirs(guild_dir, exist_ok=True)
        media_path = os.path.join(guild_dir, media.filename)
        with open(media_path, "wb") as f:
            f.write(await media.read())
    
    # Send to Discord channels as embed
    headers = {"Authorization": f"Bot {settings.discord_bot_token}"}
    async with httpx.AsyncClient() as client:
        for channel_id in channel_list:
            embed = {
                "title": "📢 Server Announcement",
                "description": content,
                "color": 0x52991f,
                "footer": {"text": "AmzCraft Network"},
                "timestamp": __import__('datetime').datetime.utcnow().isoformat()
            }
            if media_path:
                embed["image"] = {"url": f"attachment://{os.path.basename(media_path)}"}
            
            payload = {
                "embeds": [embed],
                "allowed_mentions": {"parse": ["everyone", "roles", "users"]}
            }
            
            if media_path:
                with open(media_path, "rb") as f:
                    files = {"file": (os.path.basename(media_path), f.read(), media.content_type)}
                    data = {"payload_json": json.dumps(payload)}
                    await client.post(
                        f"https://discord.com/api/v10/channels/{channel_id}/messages",
                        headers=headers,
                        data=data,
                        files=files
                    )
            else:
                await client.post(
                    f"https://discord.com/api/v10/channels/{channel_id}/messages",
                    headers=headers,
                    json=payload
                )
    
    # Save to database
    broadcast = Broadcast(guild_id=guild_id, content=content, target_channel_ids=channel_list, media_path=media_path)
    db.add(broadcast)
    await db.commit()
    return {"id": broadcast.id}

@router.get("/{guild_id}/broadcasts")
async def list_broadcasts(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Broadcast).where(Broadcast.guild_id == guild_id))
    broadcasts = result.scalars().all()
    return [{"id": b.id, "content": b.content, "created_at": b.created_at} for b in broadcasts]

@router.delete("/{guild_id}/broadcasts/{broadcast_id}")
async def delete_broadcast(guild_id: int, broadcast_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Broadcast).where(Broadcast.id == broadcast_id, Broadcast.guild_id == guild_id))
    broadcast = result.scalar_one_or_none()
    if broadcast:
        await db.delete(broadcast)
        await db.commit()
    return {"success": True}

@router.get("/broadcasts/queue")
async def get_broadcast_queue(db: AsyncSession = Depends(get_db)):
    from app.utils.redis_client import get_redis
    redis = await get_redis()
    queue_length = await redis.llen("broadcast:queue")
    return {"pending": queue_length, "processing": 0}
