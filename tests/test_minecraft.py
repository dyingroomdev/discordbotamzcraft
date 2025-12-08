import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_minecraft_status_cached(client: AsyncClient):
    mock_response = {
        "online": True,
        "players": {"online": 10, "max": 100},
        "motd": {"clean": ["Test Server"]},
        "version": "1.20.1",
        "icon": ""
    }
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.json.return_value = mock_response
        
        response = await client.get("/api/guilds/status?address=mc.example.com&type=java")
        assert response.status_code == 200
        data = response.json()
        assert data["online"] == True
        assert data["players"]["online"] == 10
