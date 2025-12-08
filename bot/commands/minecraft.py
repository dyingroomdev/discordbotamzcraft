import discord
from discord.ext import commands
from app.config import settings
import httpx

class MinecraftCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @discord.slash_command(name="ip", description="Get Minecraft server IPs", guild_ids=[1118248694236590131])
    async def ip(self, ctx):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/minecraft")
            if resp.status_code == 200:
                servers = resp.json()
                if not servers:
                    await ctx.respond("No Minecraft servers configured.", ephemeral=True)
                    return
                
                embed = discord.Embed(
                    title="🎮 Minecraft Server IPs",
                    description="Connect to AmzCraft servers using these IPs",
                    color=0x52991f
                )
                embed.set_footer(text="Click to copy • Right-click IP to copy")
                
                for server in servers:
                    port = server.get('port')
                    if port and (server['type'] == 'bedrock' or port != 25565):
                        ip_address = f"{server['address']}:{port}"
                    else:
                        ip_address = server['address']
                    
                    type_badge = "☕ Java Edition" if server['type'] == 'java' else "📱 Bedrock Edition"
                    
                    field_value = (
                        f"```ansi\n"
                        f"\u001b[1;32m{ip_address}\u001b[0m\n"
                        f"```\n"
                        f"📋 **Copy this IP to connect**"
                    )
                    
                    embed.add_field(
                        name=f"━━━━━━━━━━━━━━━━━━━━\n{type_badge}\n**{server['name']}**",
                        value=field_value,
                        inline=False
                    )
                
                await ctx.respond(embed=embed)
            else:
                await ctx.respond("Failed to fetch server IPs.", ephemeral=True)

    @discord.slash_command(name="status", description="Check Minecraft server status", guild_ids=[1118248694236590131])
    async def status(self, ctx):
        await ctx.defer()
        
        async with httpx.AsyncClient() as client:
            # Get all configured servers
            servers_resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/minecraft")
            if servers_resp.status_code != 200:
                await ctx.respond("Failed to fetch servers.", ephemeral=True)
                return
            
            servers = servers_resp.json()
            if not servers:
                await ctx.respond("No Minecraft servers configured.", ephemeral=True)
                return
            
            embed = discord.Embed(
                title="🎮 Minecraft Server Status",
                description="Live status of all AmzCraft servers",
                color=0x52991f
            )
            embed.set_footer(text="Updates every 60 seconds")
            
            for server in servers:
                # Get status for each server
                port = server.get('port')
                # Include port if it's bedrock or not default Java port
                if port and (server['type'] == 'bedrock' or port != 25565):
                    address_with_port = f"{server['address']}:{port}"
                else:
                    address_with_port = server['address']
                
                status_resp = await client.get(
                    f"{settings.app_base_url}/api/status?address={address_with_port}&type={server['type']}"
                )
                
                if status_resp.status_code == 200:
                    data = status_resp.json()
                    type_badge = "☕ Java Edition" if server['type'] == 'java' else "📱 Bedrock Edition"
                    
                    if data.get("online"):
                        players = data.get('players', {})
                        version = data.get('version', 'Unknown')
                        port_text = f":{server['port']}" if server.get('port') and server['port'] != 25565 else ""
                        
                        status_text = (
                            f"```ansi\n"
                            f"\u001b[1;32m● ONLINE\u001b[0m\n"
                            f"```\n"
                            f"**IP:** `{server['address']}{port_text}`\n"
                            f"**Players:** `{players.get('online', 0)}/{players.get('max', 0)}`\n"
                            f"**Version:** `{version}`"
                        )
                    else:
                        status_text = (
                            f"```ansi\n"
                            f"\u001b[1;31m● OFFLINE\u001b[0m\n"
                            f"```\n"
                            f"**IP:** `{server['address']}`"
                        )
                    
                    embed.add_field(
                        name=f"━━━━━━━━━━━━━━━━━━━━\n{type_badge}\n**{server['name']}**",
                        value=status_text,
                        inline=False
                    )
                else:
                    embed.add_field(
                        name=f"**{server['name']}**",
                        value="```ansi\n\u001b[1;33m⚠ Failed to check status\u001b[0m\n```",
                        inline=False
                    )
            
            await ctx.respond(embed=embed)

def setup(bot):
    bot.add_cog(MinecraftCommands(bot))
