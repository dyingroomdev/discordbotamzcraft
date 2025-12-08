from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CommandRegister(BaseModel):
    commands: list[dict]

@router.post("/{guild_id}/commands/register")
async def register_commands(guild_id: int, data: CommandRegister):
    # TODO: Call Discord API to register slash commands
    return {"registered": len(data.commands)}
