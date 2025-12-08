from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    
    database_url: str
    redis_url: str
    jwt_secret: str
    discord_bot_token: str
    discord_client_id: str
    discord_client_secret: str
    app_base_url: str
    media_dir: str = "./media"
    s3_enabled: bool = False
    s3_bucket: str = ""
    s3_region: str = ""
    port: int = 4000
    bot_webhook_secret: str = "shared_secret"
    max_upload_size: int = 10485760
    cache_ttl: int = 60

settings = Settings()
