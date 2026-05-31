import discord
from datetime import datetime, timezone


BRAND_COLOR = 0x52991F
SUCCESS_COLOR = 0x57F287
WARNING_COLOR = 0xFEE75C
ERROR_COLOR = 0xED4245


def brand_embed(title: str, description: str | None = None, color: int = BRAND_COLOR) -> discord.Embed:
    embed = discord.Embed(title=title, description=description, color=color)
    embed.timestamp = datetime.now(timezone.utc)
    embed.set_author(name="AmzCraft")
    embed.set_footer(text="AmzCraft Network")
    return embed


def code_block(value: str, color_code: str = "1;32") -> str:
    return f"```ansi\n\u001b[{color_code}m{value}\u001b[0m\n```"


def server_address(server: dict) -> str:
    port = server.get("port")
    if port and (server.get("type") == "bedrock" or port != 25565):
        return f"{server['address']}:{port}"
    return server["address"]


def edition_label(server_type: str) -> str:
    return "Java" if server_type == "java" else "Bedrock"


def edition_icon(server_type: str) -> str:
    return "☕" if server_type == "java" else "📱"


def status_label(online: bool) -> str:
    return "Online" if online else "Offline"


def status_icon(online: bool) -> str:
    return "🟢" if online else "🔴"
