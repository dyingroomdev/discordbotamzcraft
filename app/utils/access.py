import hmac

from fastapi import Header, HTTPException
from jose import JWTError, jwt

from app.config import settings


async def require_api_access(
    authorization: str | None = Header(None),
    x_bot_secret: str | None = Header(None),
):
    if x_bot_secret and hmac.compare_digest(x_bot_secret, settings.bot_webhook_secret):
        return {"type": "bot"}

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "", 1)
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            return {"type": "admin", "sub": payload.get("sub")}
        except JWTError:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")
