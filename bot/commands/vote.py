import discord
from discord.ext import commands
import httpx
from app.config import settings
from bot.api import BOT_API_HEADERS
from bot.card_images import render_vote_card
from bot.embeds import brand_embed

class VoteCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @discord.slash_command(name="help", description="Show all available commands", guild_ids=[1118248694236590131])
    async def help(self, ctx):
        embed = brand_embed(
            "AmzCraft Bot Commands",
            "Available commands for server members and staff."
        )
        
        # General Commands
        general_cmds = (
            "`/help`\n"
            "Show this help message\n\n"
            "`/vote`\n"
            "Get server voting links and rewards"
        )
        embed.add_field(
            name="General",
            value=general_cmds,
            inline=False
        )
        
        # Minecraft Commands
        mc_cmds = (
            "`/ip`\n"
            "Get Minecraft server IPs\n\n"
            "`/status`\n"
            "Check all server statuses\n\n"
            "`/leaderboard [limit]`\n"
            "Show XP leaderboard"
        )
        embed.add_field(
            name="Minecraft",
            value=mc_cmds,
            inline=False
        )
        
        # Moderation Commands
        mod_cmds = (
            "`/ban <member> [reason]`\n"
            "Ban a user from the server\n\n"
            "`/mute <member> [duration] [reason]`\n"
            "Timeout a user in minutes\n\n"
            "`/purge <limit>`\n"
            "Delete multiple messages"
        )
        embed.add_field(
            name="Moderation",
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
                
                embed = discord.Embed(color=0x52991F)
                embed.set_image(url="attachment://amzcraft-vote.png")
                embed.description = "\n".join(f"[{i}. {link['site_name']}]({link['url']})" for i, link in enumerate(links, 1))
                await ctx.respond(embed=embed, file=render_vote_card(links))
            else:
                await ctx.respond("Failed to fetch vote links.", ephemeral=True)

def setup(bot):
    bot.add_cog(VoteCommands(bot))
