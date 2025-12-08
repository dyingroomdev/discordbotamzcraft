import discord
from discord.ext import commands, tasks
from app.config import settings
import httpx
import os
import asyncio
import json
import redis.asyncio as redis


intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.guilds = True

bot = commands.Bot(intents=intents, allowed_mentions=discord.AllowedMentions(everyone=True, roles=True, users=True))
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

@tasks.loop(seconds=30)
async def update_bot_status():
    try:
        await redis_client.set(
            "bot:status",
            json.dumps({
                "online": True,
                "guilds": len(bot.guilds),
                "latency": round(bot.latency * 1000)
            }),
            ex=60
        )
        print(f"Status updated: {len(bot.guilds)} guilds, {round(bot.latency * 1000)}ms")
    except Exception as e:
        print(f"Failed to update status: {e}")

@update_bot_status.before_loop
async def before_update_status():
    await bot.wait_until_ready()

@bot.event
async def on_ready():
    print(f"Bot logged in as {bot.user}")
    bot.load_extension("bot.commands.minecraft")
    bot.load_extension("bot.commands.moderation")
    bot.load_extension("bot.commands.xp")
    bot.load_extension("bot.commands.vote")
    
    # Sync slash commands
    try:
        await bot.sync_commands()
        print(f"Slash commands synced successfully")
    except Exception as e:
        print(f"Failed to sync commands: {e}")
    
    update_bot_status.start()

@bot.event
async def on_member_join(member):
    async with httpx.AsyncClient() as client:
        channels_map = {f"#{ch.name}": ch.mention for ch in member.guild.channels if hasattr(ch, 'mention')}
        
        render_resp = await client.post(
            f"{settings.app_base_url}/api/guilds/{member.guild.id}/welcome/render",
            json={
                "user_id": member.id,
                "user_mention": member.mention,
                "user_name": member.name,
                "guild_name": member.guild.name,
                "channels": channels_map
            }
        )
        
        if render_resp.status_code == 200:
            data = render_resp.json()
            if "error" not in data:
                channel = bot.get_channel(data['channel_id'])
                if channel:
                    embed = discord.Embed(
                        title=f"Welcome to {member.guild.name}!",
                        description=data['text'],
                        color=discord.Color.green()
                    )
                    embed.set_thumbnail(url=member.display_avatar.url)
                    
                    media_path = data.get('media_path')
                    if media_path:
                        if media_path.startswith('http'):
                            embed.set_image(url=media_path)
                            await channel.send(embed=embed)
                        elif os.path.exists(media_path):
                            file = discord.File(media_path, filename="banner.gif")
                            embed.set_image(url="attachment://banner.gif")
                            await channel.send(embed=embed, file=file)
                        else:
                            await channel.send(embed=embed)
                    else:
                        await channel.send(embed=embed)

@bot.event
async def on_member_join_old(member):
    async with httpx.AsyncClient() as client:
        # Build channel mentions map
        channels_map = {f"#{ch.name}": ch.mention for ch in member.guild.channels if hasattr(ch, 'mention')}
        
        resp = await client.post(
            f"{settings.app_base_url}/api/guilds/{member.guild.id}/welcome/render",
            json={
                "user_id": member.id,
                "user_mention": member.mention,
                "user_name": member.name,
                "guild_name": member.guild.name,
                "channels": channels_map
            }
        )
        if resp.status_code == 200:
            data = resp.json()
            if "error" not in data:
                channel = bot.get_channel(data["channel_id"])
                if channel:
                    # Create beautiful embed card
                    embed = discord.Embed(
                        description=data["text"],
                        color=0x52991f
                    )
                    embed.set_author(
                        name=f"Welcome to {member.guild.name}!",
                        icon_url=member.guild.icon.url if member.guild.icon else None
                    )
                    embed.set_thumbnail(url=member.display_avatar.url)
                    embed.set_footer(text=f"Member #{member.guild.member_count}")
                    
                    # Add image/gif if available
                    if data.get("media_path") and os.path.exists(data["media_path"]):
                        file = discord.File(data["media_path"], filename="welcome.gif")
                        embed.set_image(url="attachment://welcome.gif")
                        await channel.send(embed=embed, file=file)
                    else:
                        await channel.send(embed=embed)

@bot.event
async def on_member_remove(member):
    async with httpx.AsyncClient() as client:
        channels_map = {f"#{ch.name}": ch.mention for ch in member.guild.channels if hasattr(ch, 'mention')}
        
        render_resp = await client.post(
            f"{settings.app_base_url}/api/guilds/{member.guild.id}/leave/render",
            json={
                "user_id": member.id,
                "user_mention": member.mention,
                "user_name": member.name,
                "guild_name": member.guild.name,
                "channels": channels_map
            }
        )
        
        if render_resp.status_code == 200:
            data = render_resp.json()
            if "error" not in data:
                channel = bot.get_channel(data['channel_id'])
                if channel:
                    embed = discord.Embed(
                        title=f"Goodbye from {member.guild.name}",
                        description=data['text'],
                        color=discord.Color.red()
                    )
                    embed.set_thumbnail(url=member.display_avatar.url)
                    
                    media_path = data.get('media_path')
                    if media_path:
                        if media_path.startswith('http'):
                            embed.set_image(url=media_path)
                            await channel.send(embed=embed)
                        elif os.path.exists(media_path):
                            file = discord.File(media_path, filename="banner.gif")
                            embed.set_image(url="attachment://banner.gif")
                            await channel.send(embed=embed, file=file)
                        else:
                            await channel.send(embed=embed)
                    else:
                        await channel.send(embed=embed)

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    # Increment XP
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{settings.app_base_url}/api/guilds/{message.guild.id}/xp/increment",
            json={"user_id": message.author.id, "amount": 10}
        )
    await bot.process_commands(message)



if __name__ == "__main__":
    bot.run(settings.discord_bot_token)
