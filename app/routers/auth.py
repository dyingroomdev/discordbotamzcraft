from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from app.config import settings
import httpx
from jose import jwt, JWTError
from datetime import datetime, timedelta

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    id: str
    username: str
    avatar: str
    roles: list[str] = ["admin"]

class OAuthUrlResponse(BaseModel):
    url: str

@router.get("/discord/url")
async def get_oauth_url():
    redirect_uri = "https://discord.amzcraft.top/auth/callback"
    url = f"https://discord.com/api/oauth2/authorize?client_id={settings.discord_client_id}&redirect_uri={redirect_uri}&response_type=code&scope=identify%20guilds"
    return OAuthUrlResponse(url=url)

@router.get("/discord/callback")
async def oauth_callback(code: str):
    redirect_uri = "https://discord.amzcraft.top/auth/callback"
    
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_resp = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": settings.discord_client_id,
                "client_secret": settings.discord_client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code")
        
        token_data = token_resp.json()
        access_token = token_data["access_token"]
        
        # Get user info
        user_resp = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        user_data = user_resp.json()
        
        # Check if user has Administrator permission in the configured admin server
        admin_guild_id = settings.discord_admin_guild_id
        
        # Get guild member using bot token
        member_resp = await client.get(
            f"https://discord.com/api/guilds/{admin_guild_id}/members/{user_data['id']}",
            headers={"Authorization": f"Bot {settings.discord_bot_token}"}
        )
        
        if member_resp.status_code != 200:
            raise HTTPException(status_code=403, detail="You must be a member of the configured admin server")
        
        member_data = member_resp.json()
        
        # Get guild to check owner
        guild_resp = await client.get(
            f"https://discord.com/api/guilds/{admin_guild_id}",
            headers={"Authorization": f"Bot {settings.discord_bot_token}"}
        )
        
        if guild_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to verify permissions")
        
        guild_data = guild_resp.json()
        
        # Check if user is guild owner
        if str(user_data["id"]) == str(guild_data.get("owner_id")):
            has_admin = True
        else:
            # Get guild roles
            roles_resp = await client.get(
                f"https://discord.com/api/guilds/{admin_guild_id}/roles",
                headers={"Authorization": f"Bot {settings.discord_bot_token}"}
            )
            
            if roles_resp.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to verify permissions")
            
            roles_data = roles_resp.json()
            user_roles = member_data.get("roles", [])
            
            # Check if any of user's roles have Administrator permission (0x8)
            has_admin = False
            for role in roles_data:
                if role["id"] in user_roles:
                    permissions = int(role.get("permissions", 0))
                    if permissions & 0x8:  # Administrator permission
                        has_admin = True
                        break
        
        if not has_admin:
            raise HTTPException(status_code=403, detail="You must have Administrator permission in AmzCraft server")
        
        # Create JWT
        jwt_payload = {
            "sub": str(user_data["id"]),
            "username": user_data["username"],
            "avatar": user_data.get("avatar", ""),
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        
        jwt_token = jwt.encode(jwt_payload, settings.jwt_secret, algorithm="HS256")
        
        return TokenResponse(access_token=jwt_token)

@router.get("/me")
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return UserInfo(
            id=payload["sub"],
            username=payload["username"],
            avatar=payload["avatar"],
            roles=["admin"]
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/logout")
async def logout():
    return {"success": True}
