from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import MinecraftServer
from app.utils.redis_client import get_cached, set_cached
import httpx
import json

router = APIRouter()

class ServerCreate(BaseModel):
    name: str
    address: str
    port: int | None = 25565
    type: str = "java"

@router.get("/{guild_id}/minecraft")
async def get_servers(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MinecraftServer).where(MinecraftServer.guild_id == guild_id))
    servers = result.scalars().all()
    return [{"id": s.id, "name": s.name, "address": s.address, "port": s.port, "type": s.type} for s in servers]

@router.post("/{guild_id}/minecraft")
async def add_server(guild_id: int, data: ServerCreate, db: AsyncSession = Depends(get_db)):
    server = MinecraftServer(guild_id=guild_id, name=data.name, address=data.address, port=data.port, type=data.type)
    db.add(server)
    await db.commit()
    await db.refresh(server)
    return {"id": server.id}

@router.delete("/{guild_id}/minecraft/{server_id}")
async def delete_server(guild_id: int, server_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MinecraftServer).where(MinecraftServer.id == server_id, MinecraftServer.guild_id == guild_id))
    server = result.scalar_one_or_none()
    if server:
        await db.delete(server)
        await db.commit()
    return {"success": True}

@router.get(
    "/status",
    summary="Minecraft server status",
    response_model=dict,
    responses={
        200: {
            "description": "Server status response",
            "content": {
                "application/json": {
                    "example": {
                        "online": True,
                        "players": {"online": 10, "max": 100},
                        "motd": "Welcome to the server",
                        "version": "1.20.1",
                        "icon_url": ""
                    }
                }
            }
        }
    }
)
async def get_server_status(address: str, type: str = "java"):
    """Query Minecraft server status with caching (TTL 60s)"""
    cache_key = f"mc_status:{type}:{address}"
    cached = await get_cached(cache_key)
    if cached:
        return json.loads(cached)
    
    url = f"https://api.mcsrvstat.us/{'bedrock/' if type == 'bedrock' else ''}3/{address}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=5.0)
        data = resp.json()
    
    result = {
        "online": data.get("online", False),
        "players": {"online": data.get("players", {}).get("online", 0), "max": data.get("players", {}).get("max", 0)},
        "motd": data.get("motd", {}).get("clean", [""])[0] if data.get("motd") else "",
        "version": data.get("version", ""),
        "icon_url": data.get("icon", "")
    }
    await set_cached(cache_key, json.dumps(result), ttl=60)
    return result
