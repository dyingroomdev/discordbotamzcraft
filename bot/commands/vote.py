import discord
from discord.ext import commands
import httpx
from app.config import settings
from bot.api import BOT_API_HEADERS

class VoteCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @discord.slash_command(name="help", description="Show all available commands", guild_ids=[1118248694236590131])
    async def help(self, ctx):
        embed = discord.Embed(
            title="📚 AmzCraft Bot Commands",
            description="Here are all available commands you can use",
            color=0x52991f
        )
        
        # General Commands
        general_cmds = (
            "`/help`\n"
            "└─ Show this help message\n\n"
            "`/vote`\n"
            "└─ Get server voting links and rewards"
        )
        embed.add_field(
            name="━━━━━━━━━━━━━━━━━━━━\n💬 **General Commands**",
            value=general_cmds,
            inline=False
        )
        
        # Minecraft Commands
        mc_cmds = (
            "`/ip`\n"
            "└─ Get Minecraft server IPs\n\n"
            "`/status`\n"
            "└─ Check all server statuses\n\n"
            "`/leaderboard [limit]`\n"
            "└─ Show XP leaderboard (default: 10)"
        )
        embed.add_field(
            name="━━━━━━━━━━━━━━━━━━━━\n🎮 **Minecraft Commands**",
            value=mc_cmds,
            inline=False
        )
        
        # Moderation Commands
        mod_cmds = (
            "`/ban <member> [reason]`\n"
            "└─ Ban a user from the server\n\n"
            "`/mute <member> [duration] [reason]`\n"
            "└─ Timeout a user (minutes)\n\n"
            "`/purge <limit>`\n"
            "└─ Delete multiple messages"
        )
        embed.add_field(
            name="━━━━━━━━━━━━━━━━━━━━\n🛡️ **Moderation** (Admin/Mod only)",
            value=mod_cmds,
            inline=False
        )
        
        embed.set_footer(text="AmzCraft Network • Use / to see all commands")
        await ctx.respond(embed=embed)

    @discord.slash_command(name="vote", description="Get server voting links", guild_ids=[1118248694236590131])
    async def vote(self, ctx):
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/vote")
            if resp.status_code == 200:
                links = resp.json()
                if not links:
                    await ctx.respond("No vote links configured.", ephemeral=True)
                    return
                
                embed = discord.Embed(
                    title="🗳️ Vote for AmzCraft!",
                    description="Support us by voting on these sites and earn rewards!",
                    color=0x52991f
                )
                embed.set_footer(text=f"Total Sites: {len(links)} • Vote daily for rewards!")
                
                for i, link in enumerate(links, 1):
                    vote_button = f"[👉 **Click to Vote**]({link['url']})"
                    
                    if link.get('rewards'):
                        field_value = (
                            f"{vote_button}\n"
                            f"```ansi\n"
                            f"\u001b[1;33m⭐ {link['rewards']}\u001b[0m\n"
                            f"```"
                        )
                    else:
                        field_value = vote_button
                    
                    embed.add_field(
                        name=f"━━━━━━━━━━━━━━━━━━━━\n{i}. **{link['site_name']}**",
                        value=field_value,
                        inline=False
                    )
                
                await ctx.respond(embed=embed)
            else:
                await ctx.respond("Failed to fetch vote links.", ephemeral=True)

def setup(bot):
    bot.add_cog(VoteCommands(bot))
