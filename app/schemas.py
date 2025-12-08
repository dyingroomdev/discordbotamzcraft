from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GuildBase(BaseModel):
    name: str
    default_welcome_channel: Optional[int] = None

class GuildCreate(GuildBase):
    id: int

class GuildResponse(GuildBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class WelcomeBannerBase(BaseModel):
    name: str
    channel_id: int
    text: str
    mention_channels: Optional[List[str]] = []
    enabled: bool = True

class WelcomeBannerCreate(WelcomeBannerBase):
    pass

class WelcomeBannerResponse(WelcomeBannerBase):
    id: int
    guild_id: int
    media_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class MinecraftServerBase(BaseModel):
    name: str
    address: str
    port: Optional[int] = 25565
    type: str = "java"

class MinecraftServerCreate(MinecraftServerBase):
    pass

class MinecraftServerResponse(MinecraftServerBase):
    id: int
    guild_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MinecraftStatusResponse(BaseModel):
    online: bool
    players: dict
    motd: str
    version: str
    icon_url: str

class XPResponse(BaseModel):
    user_id: int
    xp: int
    level: int

class ModerationLogResponse(BaseModel):
    id: int
    guild_id: int
    mod_id: int
    target_id: int
    action: str
    reason: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
