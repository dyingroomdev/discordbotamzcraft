from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import XP

router = APIRouter()

class XPIncrement(BaseModel):
    user_id: int
    amount: int = 10

@router.get("/{guild_id}/xp/top")
async def get_leaderboard(guild_id: int, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(XP).where(XP.guild_id == guild_id).order_by(XP.xp.desc()).limit(limit))
    users = result.scalars().all()
    return [
        {
            "user_id": str(u.user_id),
            "username": f"User {u.user_id}",
            "xp": u.xp,
            "level": u.level,
            "rank": idx + 1
        }
        for idx, u in enumerate(users)
    ]

def calculate_level(xp: int) -> int:
    """Calculate level from XP (100 XP per level)"""
    return xp // 100

@router.post("/{guild_id}/xp/increment")
async def increment_xp(guild_id: int, data: XPIncrement, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(XP).where(XP.guild_id == guild_id, XP.user_id == data.user_id))
    xp_record = result.scalar_one_or_none()
    if not xp_record:
        xp_record = XP(guild_id=guild_id, user_id=data.user_id, xp=data.amount, level=calculate_level(data.amount))
        db.add(xp_record)
    else:
        xp_record.xp += data.amount
        xp_record.level = calculate_level(xp_record.xp)
    await db.commit()
    return {"xp": xp_record.xp, "level": xp_record.level}
