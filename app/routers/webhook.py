from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.utils.security import verify_hmac
from app.models import Broadcast
import json

router = APIRouter()

class BroadcastJob(BaseModel):
    job_id: int
    guild_id: int
    content: str
    channel_ids: list[int]

@router.post("/bot/broadcast")
async def bot_broadcast_webhook(job: BroadcastJob, x_signature: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Webhook for bot to pull broadcast jobs"""
    payload = json.dumps(job.dict())
    if not verify_hmac(payload, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Bot will consume this and post messages
    return {"status": "received", "job_id": job.job_id}

@router.get("/bot/jobs/{guild_id}")
async def get_pending_jobs(guild_id: int, x_signature: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Bot polls for pending broadcast jobs"""
    # TODO: Implement job queue with Redis
    return {"jobs": []}
