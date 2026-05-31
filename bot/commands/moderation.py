import discord
from discord.ext import commands
from app.config import settings
from bot.api import BOT_API_HEADERS
from bot.embeds import brand_embed
import httpx

class ModerationCommands(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def has_mod_role(self, ctx):
        """Check if user has admin or moderator role"""
        member_roles = [role.name.lower() for role in ctx.author.roles]
        return any(role in member_roles for role in ['admin', 'administrator', 'moderator', 'mod']) or ctx.author.guild_permissions.administrator

    @discord.slash_command(name="ban", description="Ban a user (Admin/Moderator only)", guild_ids=[1118248694236590131])
    async def ban(self, ctx, member: discord.Member, reason: str = "No reason"):
        if not self.has_mod_role(ctx):
            await ctx.respond("❌ You don't have permission to use this command.", ephemeral=True)
            return
        # Log to API first
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            resp = await client.post(
                f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/moderation/action",
                json={"action": "ban", "target_id": member.id, "mod_id": ctx.author.id, "reason": reason}
            )
        # Execute action
        if resp.status_code == 200:
            await member.ban(reason=reason)
            embed = brand_embed("Member Banned", f"{member.mention} was banned.\n**Reason:** {reason}", color=0xED4245)
            await ctx.respond(embed=embed)
        else:
            await ctx.respond("❌ Failed to log action", ephemeral=True)

    @discord.slash_command(name="mute", description="Mute a user (Admin/Moderator only)", guild_ids=[1118248694236590131])
    async def mute(self, ctx, member: discord.Member, duration: int = 60, reason: str = "No reason"):
        if not self.has_mod_role(ctx):
            await ctx.respond("❌ You don't have permission to use this command.", ephemeral=True)
            return
        
        # Log to API
        async with httpx.AsyncClient(headers=BOT_API_HEADERS) as client:
            await client.post(
                f"{settings.app_base_url}/api/guilds/{ctx.guild.id}/moderation/action",
                json={"action": "mute", "target_id": member.id, "mod_id": ctx.author.id, "reason": reason}
            )
        
        # Timeout the member
        from datetime import timedelta
        await member.timeout_for(timedelta(minutes=duration), reason=reason)
        embed = brand_embed("Member Muted", f"{member.mention} was muted for `{duration}` minutes.\n**Reason:** {reason}", color=0xFEE75C)
        await ctx.respond(embed=embed)

    @discord.slash_command(name="purge", description="Delete messages (Admin/Moderator only)", guild_ids=[1118248694236590131])
    async def purge(self, ctx, limit: int):
        if not self.has_mod_role(ctx):
            await ctx.respond("❌ You don't have permission to use this command.", ephemeral=True)
            return
        await ctx.defer(ephemeral=True)
        await ctx.channel.purge(limit=limit)
        embed = brand_embed("Messages Purged", f"Deleted `{limit}` messages.", color=0x57F287)
        await ctx.followup.send(embed=embed)

def setup(bot):
    bot.add_cog(ModerationCommands(bot))
