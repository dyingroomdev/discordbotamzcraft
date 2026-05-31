import discord
from discord.ext import commands
from app.config import settings
from bot.api import BOT_API_HEADERS
from bot.card_images import render_connect_card, render_status_card
from bot.embeds import server_address
import httpx


def _copyable_addresses(servers: list[dict]) -> str:
    lines = ["Copyable addresses:"]
    for server in servers:
        label = "Java" if server.get("type") == "java" else "Bedrock"
        lines.append(f"{label}: `{server_address(server)}`")
    return "\n".join(lines)


class MinecraftCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @discord.slash_command(name="ip", description="Get Minecraft server IPs", guild_ids=[1118248694236590131])
    async def ip(self, ctx):
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/minecraft")
            if resp.status_code == 200:
                servers = resp.json()
                if not servers:
                    await ctx.respond("No Minecraft servers configured.", ephemeral=True)
                    return
                
                await ctx.respond(content=_copyable_addresses(servers), file=render_connect_card(servers))
            else:
                await ctx.respond("Failed to fetch server IPs.", ephemeral=True)

    @discord.slash_command(name="status", description="Check Minecraft server status", guild_ids=[1118248694236590131])
    async def status(self, ctx):
        await ctx.defer()
        
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            # Get all configured servers
            servers_resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/minecraft")
            if servers_resp.status_code != 200:
                await ctx.respond("Failed to fetch servers.", ephemeral=True)
                return
            
            servers = servers_resp.json()
            if not servers:
                await ctx.respond("No Minecraft servers configured.", ephemeral=True)
                return
            
            status_items = []
            
            for server in servers:
                # Get status for each server
                address_with_port = server_address(server)
                
                status_resp = await client.get(
                    f"{settings.app_base_url}/api/status",
                    params={"address": address_with_port, "type": server["type"]}
                )
                
                data = status_resp.json() if status_resp.status_code == 200 else {"online": False}
                status_items.append({"server": server, "address": address_with_port, "status": data})
            
            await ctx.respond(content=_copyable_addresses(servers), file=render_status_card(status_items))

def setup(bot):
    bot.add_cog(MinecraftCommands(bot))
