import pytest
from httpx import AsyncClient
from app.models import Guild, XP

@pytest.mark.asyncio
async def test_increment_xp(client: AsyncClient, db_session):
    guild = Guild(id=123456, name="Test Guild")
    db_session.add(guild)
    await db_session.commit()
    
    response = await client.post(
        "/api/guilds/123456/xp/increment",
        json={"user_id": 999, "amount": 50}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["xp"] == 50
    assert data["level"] == 0

@pytest.mark.asyncio
async def test_xp_leaderboard(client: AsyncClient, db_session):
    guild = Guild(id=123456, name="Test Guild")
    xp1 = XP(guild_id=123456, user_id=1, xp=500, level=5)
    xp2 = XP(guild_id=123456, user_id=2, xp=300, level=3)
    db_session.add_all([guild, xp1, xp2])
    await db_session.commit()
    
    response = await client.get("/api/guilds/123456/xp/top?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["xp"] == 500
