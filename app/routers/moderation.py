from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import ModerationLog

router = APIRouter()

class ModerationAction(BaseModel):
    action: str  # ban, mute, purge, warn
    target_id: int
    mod_id: int
    reason: str = ""

@router.post("/{guild_id}/moderation/action")
async def moderation_action(guild_id: int, data: ModerationAction, db: AsyncSession = Depends(get_db)):
    log = ModerationLog(guild_id=guild_id, mod_id=data.mod_id, target_id=data.target_id, action=data.action, reason=data.reason)
    db.add(log)
    await db.commit()
    # TODO: Execute action via bot API
    return {"success": True, "log_id": log.id}

@router.get("/{guild_id}/moderation/logs")
async def get_moderation_logs(guild_id: int, limit: int = 50, action: str = None, db: AsyncSession = Depends(get_db)):
    query = select(ModerationLog).where(ModerationLog.guild_id == guild_id)
    if action:
        query = query.where(ModerationLog.action == action)
    query = query.order_by(ModerationLog.created_at.desc()).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "target_user_id": str(l.target_id),
            "target_username": f"User {l.target_id}",
            "moderator_id": str(l.mod_id),
            "moderator_username": f"Mod {l.mod_id}",
            "reason": l.reason,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]
