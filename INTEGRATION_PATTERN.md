# Discord Bot Integration Pattern

## Architecture

Bot runs separately from API using discord.py async library.

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Discord   │ ◄─────► │  Discord Bot │ ◄─────► │  FastAPI     │
│   Gateway   │         │  (py-cord)   │         │  Backend     │
└─────────────┘         └──────────────┘         └──────────────┘
                              │                          │
                              │                          │
                              └──────────┬───────────────┘
                                         │
                                    ┌────▼─────┐
                                    │   Redis  │
                                    │PostgreSQL│
                                    └──────────┘
```

## Event Flow

### 1. Member Join (Welcome Banner)
```
Discord → on_member_join → POST /api/guilds/{id}/welcome/render
                         ← {text, channel_id, media_path}
       → Bot posts message to channel
```

### 2. Slash Commands
```
User → /status mc.example.com → Bot → GET /api/guilds/status?address=...
                                    ← {online, players, ...}
                              → Bot responds with embed
```

### 3. Moderation Actions
```
Admin → /ban @user → Bot → POST /api/guilds/{id}/moderation/action
                         ← {success, log_id}
                  → Bot executes ban
                  → Bot responds with confirmation
```

### 4. Broadcast System
```
Admin UI → POST /api/guilds/{id}/broadcast → Creates job in DB
                                           → Bot polls /api/webhook/bot/jobs/{id}
                                           ← {jobs: [...]}
                                           → Bot posts to channels
```

### 5. XP System
```
User message → on_message → POST /api/guilds/{id}/xp/increment
                         ← {xp, level}
                         → (silent, no response)
```

## Token Templating

Supported tokens in messages:
- `{user_mention}` - @User mention
- `{user_name}` - Plain username
- `{guild_name}` - Server name
- `{channel:#name}` - Channel mention
- `{everyone}` - @everyone (permission-gated)
- `{here}` - @here (permission-gated)

Example:
```
Welcome {user_mention} to {guild_name}! Check out {channel:#rules}
```

Rendered:
```
Welcome @JohnDoe to Amaze Gaming! Check out #rules
```

## Security

### Bot-to-API Authentication
- HMAC signature in `X-Signature` header
- Payload signed with shared secret (JWT_SECRET)
- Verify on API side before processing

### API-to-Bot Communication
- Bot polls API endpoints (pull model)
- Alternative: Webhook push with HMAC verification
- Rate limiting per guild/user

## Slash Command Registration

Bot registers commands on startup:
```python
@bot.event
async def on_ready():
    await bot.sync_commands()  # Syncs with Discord
```

Commands defined in bot/commands/:
- minecraft.py - /status, /ip
- moderation.py - /ban, /kick, /mute, /purge
- xp.py - /leaderboard, /rank

## Background Tasks

Bot runs background tasks:
1. Poll broadcast jobs (every 10s)
2. Update server status cache (every 60s)
3. Sync slash commands (on startup)

## Error Handling

Bot gracefully handles:
- API unavailable → Log error, continue
- Missing permissions → Respond with error message
- Invalid data → Validate before API call
- Rate limits → Backoff and retry
