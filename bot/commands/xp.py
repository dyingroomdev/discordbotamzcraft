import discord
from discord.ext import commands
from app.config import settings
from bot.api import BOT_API_HEADERS
import httpx

class XPCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @discord.slash_command(name="leaderboard", description="Show XP leaderboard", guild_ids=[1118248694236590131])
    async def leaderboard(self, ctx, limit: int = 10):
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            resp = await client.get(f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/xp/top?limit={limit}")
            data = resp.json()
        
        embed = discord.Embed(title="🏆 XP Leaderboard", color=discord.Color.gold())
        for i, user in enumerate(data, 1):
            member = ctx.guild.get_member(user["user_id"])
            name = member.display_name if member else f"User {user['user_id']}"
            embed.add_field(name=f"{i}. {name}", value=f"Level {user['level']} - {user['xp']} XP", inline=False)
        
        await ctx.respond(embed=embed)

def setup(bot):
    bot.add_cog(XPCommands(bot))
