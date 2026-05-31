from fastapi import APIRouter, Depends
from app.routers import auth, guilds, banners, minecraft, broadcast, media, xp, moderation, commands, webhook, status, vote, discord
from app.utils.access import require_api_access

router = APIRouter()

router.include_router(status.router, prefix="/status", tags=["status"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
protected = [Depends(require_api_access)]
router.include_router(guilds.router, prefix="/guilds", tags=["guilds"], dependencies=protected)
router.include_router(banners.router, prefix="/guilds", tags=["banners"], dependencies=protected)
router.include_router(broadcast.router, prefix="/guilds", tags=["broadcast"], dependencies=protected)
router.include_router(broadcast.router, tags=["broadcast"], dependencies=protected)
router.include_router(minecraft.router, prefix="/guilds", tags=["minecraft"], dependencies=protected)
router.include_router(minecraft.router, tags=["minecraft"], dependencies=protected)
router.include_router(media.router, prefix="/guilds", tags=["media"], dependencies=protected)
router.include_router(media.router, tags=["media"], dependencies=protected)
router.include_router(xp.router, prefix="/guilds", tags=["xp"], dependencies=protected)
router.include_router(moderation.router, prefix="/guilds", tags=["moderation"], dependencies=protected)
router.include_router(commands.router, prefix="/guilds", tags=["commands"], dependencies=protected)
router.include_router(vote.router, prefix="/guilds", tags=["vote"], dependencies=protected)
router.include_router(discord.router, tags=["discord"], dependencies=protected)
router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
