from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter()

@router.get("/guilds/{guild_id}/discord-channels")
async def get_discord_channels(guild_id: int):
    """Fetch channels directly from Discord API"""
    headers = {"Authorization": f"Bot {settings.discord_bot_token}"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://discord.com/api/v10/guilds/{guild_id}/channels",
            headers=headers
        )
        
        if resp.status_code != 200:
            return []
        
        channels = resp.json()
        # Filter all messageable channels (exclude categories=4, voice=2, stage=13)
        messageable_channels = [
            {"id": str(ch["id"]), "name": ch["name"]}
            for ch in channels
            if ch.get("type") not in [2, 4, 13]
        ]
        return sorted(messageable_channels, key=lambda x: x["name"])
