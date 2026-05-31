import discord
from discord.ext import commands
from app.config import settings
from bot.api import BOT_API_HEADERS
from bot.embeds import brand_embed, edition_icon, edition_label, server_address, status_icon, status_label
import httpx


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
                
                embed = brand_embed(
                    "Server Addresses",
                    "Choose your edition and copy the matching gateway."
                )
                embed.set_footer(text="AmzCraft Network • Long-press or right-click an address to copy")
                
                for server in servers:
                    embed.add_field(
                        name=f"{edition_icon(server['type'])} {edition_label(server['type'])} Gateway",
                        value=f"`{server_address(server)}`",
                        inline=True
                    )
                
                await ctx.respond(embed=embed)
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
            
            embed = brand_embed(
                "Server Status",
                "Live health for the configured AmzCraft gateways."
            )
            embed.set_footer(text="AmzCraft Network • Updated from the live status API")
            
            for server in servers:
                # Get status for each server
                address_with_port = server_address(server)
                
                status_resp = await client.get(
                    f"{settings.app_base_url}/api/status",
                    params={"address": address_with_port, "type": server["type"]}
                )
                
                if status_resp.status_code == 200:
                    data = status_resp.json()
                    online = bool(data.get("online"))
                    if online:
                        players = data.get("players", {})
                        status_text = (
                            f"{status_icon(online)} **{status_label(online)}**\n"
                            f"`{address_with_port}`\n"
                            f"Players: **{players.get('online', 0)} / {players.get('max', 0)}**\n"
                            f"Version: **{data.get('version', 'Unknown')}**"
                        )
                    else:
                        status_text = (
                            f"{status_icon(online)} **{status_label(online)}**\n"
                            f"`{address_with_port}`"
                        )
                else:
                    status_text = (
                        "🟡 **Unavailable**\n"
                        f"`{address_with_port}`"
                    )
                
                embed.add_field(
                    name=f"{edition_icon(server['type'])} {edition_label(server['type'])} Gateway",
                    value=status_text,
                    inline=True
                )
            
            await ctx.respond(embed=embed)

def setup(bot):
    bot.add_cog(MinecraftCommands(bot))
