from fastapi import Request, HTTPException
from app.utils.redis_client import redis_client
import time

async def rate_limit_middleware(request: Request, call_next):
    """Rate limit per IP: 100 requests per minute"""
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"
    
    current = await redis_client.get(key)
    if current and int(current) > 100:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    await redis_client.incr(key)
    await redis_client.expire(key, 60)
    
    response = await call_next(request)
    return response
