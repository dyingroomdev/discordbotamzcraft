from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import VoteLink

router = APIRouter()

class VoteLinkCreate(BaseModel):
    url: str
    site_name: str
    rewards: str = ""

@router.get("/{guild_id}/vote")
async def list_vote_links(guild_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VoteLink).where(VoteLink.guild_id == guild_id))
    links = result.scalars().all()
    return [{"id": l.id, "url": l.url, "site_name": l.site_name, "rewards": l.rewards} for l in links]

@router.post("/{guild_id}/vote")
async def create_vote_link(guild_id: int, data: VoteLinkCreate, db: AsyncSession = Depends(get_db)):
    link = VoteLink(guild_id=guild_id, url=data.url, site_name=data.site_name, rewards=data.rewards)
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return {"id": link.id, "url": link.url, "site_name": link.site_name, "rewards": link.rewards}

@router.delete("/{guild_id}/vote/{link_id}")
async def delete_vote_link(guild_id: int, link_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VoteLink).where(VoteLink.id == link_id, VoteLink.guild_id == guild_id))
    link = result.scalar_one_or_none()
    if link:
        await db.delete(link)
        await db.commit()
    return {"success": True}
