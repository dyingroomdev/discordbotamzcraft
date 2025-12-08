from fastapi import APIRouter
from app.routers import auth, guilds, banners, minecraft, broadcast, media, xp, moderation, commands, webhook, status, vote, discord

router = APIRouter()

router.include_router(status.router, prefix="/status", tags=["status"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(guilds.router, prefix="/guilds", tags=["guilds"])
router.include_router(banners.router, prefix="/guilds", tags=["banners"])
router.include_router(broadcast.router, prefix="/guilds", tags=["broadcast"])
router.include_router(broadcast.router, tags=["broadcast"])
router.include_router(minecraft.router, prefix="/guilds", tags=["minecraft"])
router.include_router(minecraft.router, tags=["minecraft"])
router.include_router(media.router, prefix="/guilds", tags=["media"])
router.include_router(media.router, tags=["media"])
router.include_router(xp.router, prefix="/guilds", tags=["xp"])
router.include_router(moderation.router, prefix="/guilds", tags=["moderation"])
router.include_router(commands.router, prefix="/guilds", tags=["commands"])
router.include_router(vote.router, prefix="/guilds", tags=["vote"])
router.include_router(discord.router, tags=["discord"])
router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
