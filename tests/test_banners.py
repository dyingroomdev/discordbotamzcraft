import pytest
from httpx import AsyncClient
from app.models import Guild, WelcomeBanner

@pytest.mark.asyncio
async def test_create_welcome_banner(client: AsyncClient, db_session):
    guild = Guild(id=123456, name="Test Guild")
    db_session.add(guild)
    await db_session.commit()
    
    response = await client.post(
        "/api/guilds/123456/welcome",
        data={"name": "Test Banner", "channel_id": 789, "text": "Welcome {user_mention}!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data

@pytest.mark.asyncio
async def test_list_welcome_banners(client: AsyncClient, db_session):
    guild = Guild(id=123456, name="Test Guild")
    banner = WelcomeBanner(guild_id=123456, name="Test", channel_id=789, text="Hello")
    db_session.add(guild)
    db_session.add(banner)
    await db_session.commit()
    
    response = await client.get("/api/guilds/123456/welcome")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test"
