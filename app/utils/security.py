import hmac
import hashlib
from app.config import settings

def verify_hmac(payload: str, signature: str) -> bool:
    """Verify HMAC signature for bot-to-API requests"""
    expected = hmac.new(settings.jwt_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

def generate_hmac(payload: str) -> str:
    """Generate HMAC signature"""
    return hmac.new(settings.jwt_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
