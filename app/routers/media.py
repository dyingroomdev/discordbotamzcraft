from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Media
from app.config import settings
import os

router = APIRouter()

ALLOWED_MIMES = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4"]
MAX_SIZE = 10 * 1024 * 1024  # 10MB

@router.get("/{guild_id}/media")
async def list_media(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Media).where(Media.guild_id == guild_id).order_by(Media.uploaded_at.desc()))
    media = result.scalars().all()
    return [{"id": m.id, "filename": m.filename, "path": f"/media/{m.id}", "mime": m.mime, "uploaded_at": m.uploaded_at.isoformat()} for m in media]

@router.post("/{guild_id}/media")
async def upload_media(guild_id: int, file: UploadFile = File(), db: AsyncSession = Depends(get_db)):
    if file.content_type not in ALLOWED_MIMES:
        return {"error": "Invalid file type"}
    
    content = await file.read()
    if len(content) > MAX_SIZE:
        return {"error": "File too large"}
    
    guild_dir = os.path.join(settings.media_dir, f"guild_{guild_id}")
    os.makedirs(guild_dir, exist_ok=True)
    filepath = os.path.join(guild_dir, file.filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    media = Media(guild_id=guild_id, path=filepath, filename=file.filename, mime=file.content_type, uploader_id=0)
    db.add(media)
    await db.commit()
    return {"id": media.id, "path": filepath}

@router.delete("/{guild_id}/media/{media_id}")
async def delete_media(guild_id: int, media_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Media).where(Media.id == media_id, Media.guild_id == guild_id))
    media = result.scalar_one_or_none()
    if media:
        if os.path.exists(media.path):
            os.remove(media.path)
        await db.delete(media)
        await db.commit()
    return {"success": True}

@router.get("/media/{media_id}")
async def get_media(media_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Media).where(Media.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        return {"error": "Not found"}
    return FileResponse(media.path)
