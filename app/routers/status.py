from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.utils.redis_client import get_redis
import httpx

router = APIRouter()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    redis = await get_redis()
    
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except:
        db_status = "disconnected"
    
    redis_status = "connected"
    try:
        await redis.ping()
    except:
        redis_status = "disconnected"
    
    return {
        "status": "healthy" if db_status == "connected" and redis_status == "connected" else "unhealthy",
        "database": db_status,
        "redis": redis_status
    }

@router.get("/bot")
async def bot_status():
    redis = await get_redis()
    
    try:
        bot_data = await redis.get("bot:status")
        if bot_data:
            import json
            data = json.loads(bot_data)
            return {
                "online": data.get("online", False),
                "guilds": data.get("guilds", 0),
                "latency": data.get("latency", 0)
            }
    except:
        pass
    
    return {"online": False, "guilds": 0, "latency": 0}

@router.get("/minecraft/summary")
async def minecraft_summary(db: AsyncSession = Depends(get_db)):
    from app.models import MinecraftServer
    from sqlalchemy import select, func
    
    try:
        result = await db.execute(select(func.count(MinecraftServer.id)))
        total = result.scalar() or 0
    except Exception as exc:
        print(f"Failed to read Minecraft summary: {exc}")
        total = 0
    
    return {
        "total_servers": total,
        "online_servers": 0,
        "total_players": 0,
        "totalServers": total,
        "onlineServers": 0,
        "totalPlayers": 0,
        "problematicServers": []
    }
