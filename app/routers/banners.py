from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import WelcomeBanner, LeaveBanner
from app.utils.tokens import render_template
import os
from app.config import settings

router = APIRouter()

class BannerCreate(BaseModel):
    name: str
    channel_id: int
    text: str
    mention_channels: list = []

@router.get("/{guild_id}/welcome")
async def get_welcome_banners(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelcomeBanner).where(WelcomeBanner.guild_id == guild_id))
    banners = result.scalars().all()
    return [{"id": b.id, "name": b.name, "enabled": b.enabled, "text": b.text, "channel_id": b.channel_id, "media_path": f"/api/media/{b.id}" if b.media_path else None} for b in banners]

@router.post("/{guild_id}/welcome")
async def create_welcome_banner(guild_id: int, name: str = Form(), channel_id: int = Form(), text: str = Form(), media: UploadFile = File(None), db: AsyncSession = Depends(get_db)):
    media_path = None
    if media:
        guild_dir = os.path.join(settings.media_dir, f"guild_{guild_id}")
        os.makedirs(guild_dir, exist_ok=True)
        media_path = os.path.join(guild_dir, media.filename)
        with open(media_path, "wb") as f:
            f.write(await media.read())
    banner = WelcomeBanner(guild_id=guild_id, name=name, channel_id=channel_id, text=text, media_path=media_path)
    db.add(banner)
    await db.commit()
    return {"id": banner.id}

@router.put("/{guild_id}/welcome/{banner_id}")
async def update_welcome_banner(guild_id: int, banner_id: int, data: BannerCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelcomeBanner).where(WelcomeBanner.id == banner_id, WelcomeBanner.guild_id == guild_id))
    banner = result.scalar_one_or_none()
    if not banner:
        return {"error": "Not found"}
    banner.name = data.name
    banner.text = data.text
    await db.commit()
    return {"success": True}

@router.delete("/{guild_id}/welcome/{banner_id}")
async def delete_welcome_banner(guild_id: int, banner_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelcomeBanner).where(WelcomeBanner.id == banner_id, WelcomeBanner.guild_id == guild_id))
    banner = result.scalar_one_or_none()
    if banner:
        await db.delete(banner)
        await db.commit()
    return {"success": True}

class RenderRequest(BaseModel):
    user_id: int
    user_mention: str
    user_name: str
    guild_name: str
    channels: dict = {}

class PreviewRequest(BaseModel):
    text: str

@router.post("/{guild_id}/welcome/preview")
async def preview_welcome(guild_id: int, req: PreviewRequest):
    rendered_text = render_template(
        req.text,
        user_mention="@SampleUser",
        user_name="SampleUser",
        guild_name="Your Server",
        channels={"#general": "<#123456789>", "#rules": "<#987654321>"}
    )
    return {"text": rendered_text}

@router.post("/{guild_id}/welcome/render")
async def render_welcome(guild_id: int, req: RenderRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelcomeBanner).where(WelcomeBanner.guild_id == guild_id, WelcomeBanner.enabled == True))
    banner = result.scalar_one_or_none()
    if not banner:
        return {"error": "No enabled banner"}
    rendered_text = render_template(banner.text, user_mention=req.user_mention, user_name=req.user_name, guild_name=req.guild_name, channels=req.channels)
    return {"text": rendered_text, "channel_id": banner.channel_id, "media_path": banner.media_path}

# Leave Banners
@router.get("/{guild_id}/leave")
async def get_leave_banners(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveBanner).where(LeaveBanner.guild_id == guild_id))
    banners = result.scalars().all()
    return [{"id": b.id, "name": b.name, "enabled": b.enabled, "text": b.text, "channel_id": b.channel_id, "media_path": f"/api/media/{b.id}" if b.media_path else None} for b in banners]

@router.post("/{guild_id}/leave")
async def create_leave_banner(guild_id: int, name: str = Form(), channel_id: int = Form(), text: str = Form(), media: UploadFile = File(None), db: AsyncSession = Depends(get_db)):
    media_path = None
    if media:
        guild_dir = os.path.join(settings.media_dir, f"guild_{guild_id}")
        os.makedirs(guild_dir, exist_ok=True)
        media_path = os.path.join(guild_dir, media.filename)
        with open(media_path, "wb") as f:
            f.write(await media.read())
    banner = LeaveBanner(guild_id=guild_id, name=name, channel_id=channel_id, text=text, media_path=media_path)
    db.add(banner)
    await db.commit()
    return {"id": banner.id}

@router.put("/{guild_id}/leave/{banner_id}")
async def update_leave_banner(guild_id: int, banner_id: int, data: BannerCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveBanner).where(LeaveBanner.id == banner_id, LeaveBanner.guild_id == guild_id))
    banner = result.scalar_one_or_none()
    if not banner:
        return {"error": "Not found"}
    banner.name = data.name
    banner.text = data.text
    await db.commit()
    return {"success": True}

@router.delete("/{guild_id}/leave/{banner_id}")
async def delete_leave_banner(guild_id: int, banner_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveBanner).where(LeaveBanner.id == banner_id, LeaveBanner.guild_id == guild_id))
    banner = result.scalar_one_or_none()
    if banner:
        await db.delete(banner)
        await db.commit()
    return {"success": True}

@router.post("/{guild_id}/leave/preview")
async def preview_leave(guild_id: int, req: PreviewRequest):
    rendered_text = render_template(
        req.text,
        user_mention="@SampleUser",
        user_name="SampleUser",
        guild_name="Your Server",
        channels={"#general": "<#123456789>", "#rules": "<#987654321>"}
    )
    return {"text": rendered_text}

@router.post("/{guild_id}/leave/render")
async def render_leave(guild_id: int, req: RenderRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveBanner).where(LeaveBanner.guild_id == guild_id, LeaveBanner.enabled == True))
    banner = result.scalar_one_or_none()
    if not banner:
        return {"error": "No enabled banner"}
    rendered_text = render_template(banner.text, user_mention=req.user_mention, user_name=req.user_name, guild_name=req.guild_name, channels=req.channels)
    return {"text": rendered_text, "channel_id": banner.channel_id, "media_path": banner.media_path}
