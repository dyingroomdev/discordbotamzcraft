export const routes = {
  // Overview
  dashboard: '/',
  health: '/health',
  
  // Community
  welcomeBanners: '/banners/welcome',
  leaveBanners: '/banners/leave',
  broadcasts: '/broadcasts',
  media: '/media',
  
  // Game Ops
  minecraft: '/minecraft',
  minecraftStatus: '/minecraft/status',
  minecraftVotes: '/minecraft/votes',
  
  // Moderation
  moderationLogs: '/moderation/logs',
  moderationTools: '/moderation/tools',
  
  // Analytics
  xpLeaderboard: '/analytics/xp',
  chatMetrics: '/analytics/chat',
  
  // Settings
  settings: '/settings',
  integrations: '/settings/integrations',
  
  // Auth
  login: '/login',
  authCallback: '/auth/callback',
} as const

export type RouteKey = keyof typeof routes
export type RoutePath = typeof routes[RouteKey]
