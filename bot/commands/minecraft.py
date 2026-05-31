import discord
from discord.ext import commands
from app.config import settings
from bot.api import BOT_API_HEADERS
from bot.embeds import brand_embed, edition_label, server_address
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
                    "AmzCraft Server Addresses",
                    "Choose the edition you play on and copy the address."
                )
                embed.set_footer(text="Tip: long-press or right-click an address to copy it")
                
                for server in servers:
                    ip_address = server_address(server)
                    field_value = (
                        f"**Address**\n"
                        f"`{ip_address}`"
                    )
                    
                    embed.add_field(
                        name=edition_label(server["type"]),
                        value=field_value,
                        inline=False
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
                "AmzCraft Server Status",
                "Live status for configured Minecraft servers."
            )
            embed.set_footer(text="Updated from the live server status API")
            
            for server in servers:
                # Get status for each server
                address_with_port = server_address(server)
                
                status_resp = await client.get(
                    f"{settings.app_base_url}/api/status",
                    params={"address": address_with_port, "type": server["type"]}
                )
                
                if status_resp.status_code == 200:
                    data = status_resp.json()
                    if data.get("online"):
                        players = data.get('players', {})
                        version = data.get('version', 'Unknown')
                        
                        status_text = (
                            f"**Status:** Online\n"
                            f"**Address:** `{address_with_port}`\n"
                            f"**Players:** `{players.get('online', 0)} / {players.get('max', 0)}`\n"
                            f"**Version:** `{version}`"
                        )
                    else:
                        status_text = (
                            f"**Status:** Offline\n"
                            f"**Address:** `{address_with_port}`"
                        )
                    
                    embed.add_field(
                        name=edition_label(server["type"]),
                        value=status_text,
                        inline=False
                    )
                else:
                    embed.add_field(
                        name=edition_label(server["type"]),
                        value=f"**Status:** Unavailable\n**Address:** `{address_with_port}`",
                        inline=False
                    )
            
            await ctx.respond(embed=embed)

def setup(bot):
    bot.add_cog(MinecraftCommands(bot))
