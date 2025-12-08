import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_guilds(client: AsyncClient):
    response = await client.get("/api/guilds")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_guild_not_found(client: AsyncClient):
    response = await client.get("/api/guilds/999999")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
