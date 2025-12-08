import redis.asyncio as redis
from app.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)

async def get_redis():
    return redis_client

async def get_cached(key: str):
    return await redis_client.get(key)

async def set_cached(key: str, value: str, ttl: int = 60):
    await redis_client.set(key, value, ex=ttl)
