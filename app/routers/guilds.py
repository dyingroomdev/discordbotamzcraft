from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Guild

router = APIRouter()

@router.get("")
async def list_guilds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Guild))
    guilds = result.scalars().all()
    return [{"id": g.id, "name": g.name} for g in guilds]

@router.get("/{guild_id}")
async def get_guild(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Guild).where(Guild.id == guild_id))
    guild = result.scalar_one_or_none()
    if not guild:
        return {"error": "Guild not found"}
    return {
        "guild_id": str(guild.id),
        "name": guild.name,
        "prefix": guild.prefix or "!",
        "xp_enabled": guild.xp_enabled,
        "xp_rate": guild.xp_rate or 10,
        "welcome_enabled": guild.welcome_enabled,
        "leave_enabled": guild.leave_enabled,
        "moderation_log_channel": guild.moderation_log_channel
    }

@router.get("/{guild_id}/channels")
async def get_guild_channels(guild_id: int, db: AsyncSession = Depends(get_db)):
    from app.models import Channel
    result = await db.execute(select(Channel).where(Channel.guild_id == guild_id))
    channels = result.scalars().all()
    return [{"id": str(c.id), "name": c.name} for c in channels]

@router.put("/{guild_id}")
async def update_guild(guild_id: int, updates: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Guild).where(Guild.id == guild_id))
    guild = result.scalar_one_or_none()
    if not guild:
        return {"error": "Guild not found"}
    
    for key, value in updates.items():
        if hasattr(guild, key):
            setattr(guild, key, value)
    
    await db.commit()
    await db.refresh(guild)
    return {"success": True}
