# Feature Implementation Prompts

Use these prompts with AI code generators to implement remaining admin console features.

---

## B. Broadcast Composer

**Prompt:**
```
Create a Broadcast composer page for the admin console:

Files to create:
- src/pages/BroadcastsPage.tsx
- src/components/BroadcastComposer.tsx
- src/hooks/useBroadcasts.ts

Requirements:
- Rich textarea with token helper buttons (@member, #channel, @everyone, @here)
- Channel multi-select dropdown (fetch from GET /api/guilds/{guildId}/channels)
- Optional file attachment with preview
- Validation: check bot permissions via GET /api/guilds/{guildId}/permissions
- Submit to POST /api/guilds/{guildId}/broadcast
- Show job status polling after submit
- Broadcast audit trail table below composer

API Hooks needed:
- useGuildChannels(guildId)
- useGuildPermissions(guildId)
- useCreateBroadcast(guildId)
- useBroadcastHistory(guildId)

Form fields:
- content: string (textarea with token buttons)
- channel_ids: number[] (multi-select)
- media: File | null (optional)

Use Tailwind, Headless UI, and React Query. Match existing dark theme.
```

---

## C. Minecraft Servers Page

**Prompt:**
```
Create a Minecraft servers management page:

Files to create:
- src/pages/MinecraftServersPage.tsx
- src/components/ServerModal.tsx
- src/components/ServerStatusBadge.tsx
- src/hooks/useMinecraft.ts

Requirements:
- Table with columns: name, type, address:port, status, players, vote links, actions
- Status badge fetches from GET /api/minecraft/status?address={}&type={}
- Create/Edit modal with fields:
  - name: string
  - type: 'java' | 'bedrock'
  - address: string
  - port: number
  - alt_addresses: string[] (dynamic list)
  - vote_links: string[] (dynamic list)
- Test connection button in modal
- Bulk CSV import button (parse CSV and batch create)
- Submit to POST /api/guilds/{guildId}/minecraft

API Hooks:
- useMinecraftServers(guildId)
- useCreateServer(guildId)
- useUpdateServer(guildId, serverId)
- useDeleteServer(guildId)
- useServerStatus(address, type)

CSV format: name,type,address,port
Include CSV parser utility and file upload handler.
```

---

## D. Media Library

**Prompt:**
```
Create a media library page with upload functionality:

Files to create:
- src/pages/MediaLibraryPage.tsx
- src/components/MediaGrid.tsx
- src/components/MediaUpload.tsx
- src/hooks/useMedia.ts

Requirements:
- Grid gallery showing thumbnails with hover overlay (filename, size, date)
- Drag-and-drop upload zone
- Progress bar during upload
- Client-side image preview before upload
- Bulk select and delete
- Copy URL button for each media item
- File validation: images (png, jpg, gif, webp), video (mp4), max 10MB
- Upload to POST /api/guilds/{guildId}/media (multipart/form-data)

API Hooks:
- useMediaLibrary(guildId)
- useUploadMedia(guildId) - with progress tracking
- useDeleteMedia(guildId)

Features:
- Grid layout (4 columns on desktop, responsive)
- Lightbox for image preview
- Filter by type (images, videos, all)
- Search by filename

Use react-dropzone for drag-and-drop.
```

---

## E. Moderation Console

**Prompt:**
```
Create a moderation console with logs and quick actions:

Files to create:
- src/pages/ModerationPage.tsx
- src/components/ModerationLogs.tsx
- src/components/QuickActions.tsx
- src/hooks/useModeration.ts

Requirements:
- Logs table with columns: timestamp, action, moderator, target, reason
- Filters: action type dropdown, date range picker, search by user
- Quick action panel with buttons: Ban, Kick, Mute, Purge
- Each action opens confirmation modal with reason input
- Submit to POST /api/guilds/{guildId}/moderation/action
- Show success toast and refresh logs after action
- Export logs to CSV button

API Hooks:
- useModerationLogs(guildId, filters)
- useModerateUser(guildId)

Quick action form:
- action: 'ban' | 'kick' | 'mute' | 'purge'
- target_id: string (user ID input)
- mod_id: string (from auth context)
- reason: string

Use date-fns for date formatting and filtering.
```

---

## F. XP Leaderboard

**Prompt:**
```
Create an XP leaderboard page with analytics:

Files to create:
- src/pages/XPLeaderboardPage.tsx
- src/components/LeaderboardTable.tsx
- src/hooks/useXP.ts

Requirements:
- Table showing top users with columns: rank, avatar, username, XP, level
- Avatar images from Discord CDN: https://cdn.discordapp.com/avatars/{userId}/{avatar}.png
- Time range filter: 7d, 30d, all time
- Limit selector: 10, 25, 50, 100
- Export to CSV button
- Fetch from GET /api/guilds/{guildId}/xp/top?limit={}&range={}
- Progress bar showing XP to next level
- Highlight current user if in list

API Hooks:
- useXPLeaderboard(guildId, limit, range)
- useExportXP(guildId)

Table features:
- Sortable columns
- Pagination if > 100 results
- Search/filter by username
- Color-coded levels (bronze, silver, gold, diamond)

CSV export format: rank,username,xp,level
```

---

## G. Guild Settings

**Prompt:**
```
Create a guild settings page:

Files to create:
- src/pages/SettingsPage.tsx
- src/components/SettingSection.tsx
- src/hooks/useSettings.ts

Requirements:
- Sections: General, Features, Notifications, Integrations
- General: guild name, default welcome channel, prefix
- Features: toggle switches for welcome, xp, moderation, minecraft
- Notifications: webhook URL for events
- Save button (PUT /api/guilds/{guildId}/settings)
- Show unsaved changes indicator
- Confirmation before leaving with unsaved changes

API Hooks:
- useGuildSettings(guildId)
- useUpdateSettings(guildId)

Settings schema:
- welcome_enabled: boolean
- xp_enabled: boolean
- moderation_enabled: boolean
- minecraft_enabled: boolean
- default_channel: number
- webhook_url: string

Use form state management and dirty checking.
```

---

## H. Analytics Dashboard

**Prompt:**
```
Create an analytics dashboard with charts:

Files to create:
- src/pages/AnalyticsPage.tsx
- src/components/ChartCard.tsx
- src/hooks/useAnalytics.ts

Requirements:
- Charts: Member growth, Message activity, XP trends, Top channels
- Date range selector: 7d, 30d, 90d
- Fetch from GET /api/guilds/{guildId}/analytics?range={}
- Use recharts library for charts
- Export data to CSV
- Real-time updates (poll every 30s)

API Hooks:
- useAnalytics(guildId, range)

Charts:
1. Line chart: Member count over time
2. Bar chart: Messages per channel
3. Area chart: XP earned over time
4. Pie chart: Activity by hour

Use recharts components: LineChart, BarChart, AreaChart, PieChart
```

---

## Usage Instructions

1. Copy the prompt for the feature you want to implement
2. Paste into your AI code generator (Cursor, Copilot, Claude, etc.)
3. Review generated code
4. Test the feature
5. Adjust as needed

## Notes

- All prompts assume the existing project structure
- Use the established patterns (hooks, components, styling)
- Match the dark theme with brand colors
- Include loading states and error handling
- Add form validation where appropriate
- Use React Query for data fetching
- Follow TypeScript best practices
