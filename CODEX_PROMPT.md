# Codex-Optimized Prompt for FastAPI Discord Bot

Generate a FastAPI project skeleton using Async SQLAlchemy + Alembic and asyncpg targeting PostgreSQL. Include models for Guild, WelcomeBanner, MinecraftServer, Media, and XP. Add endpoints for CRUD on welcome banners and a proxied /minecraft/status endpoint that queries https://api.mcsrvstat.us/3/<address> and https://api.mcsrvstat.us/bedrock/3/<address> depending on server type. Implement caching with aioredis (TTL 60s). Provide dependency-based DB session, Pydantic schemas, and unit tests skeleton. Add environment variable configuration using pydantic BaseSettings.

## Key Requirements

1. **Framework**: FastAPI with async/await
2. **Database**: PostgreSQL with async SQLAlchemy 2.x + asyncpg
3. **Migrations**: Alembic
4. **Caching**: Redis with aioredis
5. **Models**: Guild, WelcomeBanner, LeaveBanner, MinecraftServer, Broadcast, XP, ModerationLog, Media
6. **Auth**: JWT + Discord OAuth2 + HMAC for bot-to-API
7. **Features**:
   - Welcome/leave banners with token replacement
   - Minecraft server status proxy with caching
   - XP system with leaderboards
   - Moderation logging
   - Media uploads (local + S3)
   - Broadcast system
8. **Testing**: pytest + pytest-asyncio + httpx

## Sample Minimal Structure

```python
# app/main.py
from fastapi import FastAPI
from app.api import router as api_router

app = FastAPI(title="Amaze Gaming API")
app.include_router(api_router, prefix="/api")
```

## Expected Output

- Complete project structure with all models, routers, schemas
- Async database session management
- Redis caching utilities
- Rate limiting middleware
- HMAC security for bot endpoints
- Comprehensive test suite
- Docker Compose for local development
- Alembic migrations setup
