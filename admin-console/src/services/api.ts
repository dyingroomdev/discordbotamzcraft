import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const apiUrl = (path: string) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export const fetchApiBlobUrl = async (path: string) => {
  const headers: HeadersInit = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(apiUrl(path), {
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to load media: ${response.status}`)
  }

  return URL.createObjectURL(await response.blob())
}

export interface APIError {
  status: number
  code: string
  message: string
  details?: any
}

// Create axios instance
const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies
})

// Request interceptor - attach auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(formatError(error))
    }

    // Retry on network errors (max 3 attempts)
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1s backoff
      return client(originalRequest)
    }

    return Promise.reject(formatError(error))
  }
)

// Format error to standard shape
function formatError(error: AxiosError): APIError {
  if (error.response) {
    return {
      status: error.response.status,
      code: (error.response.data as any)?.code || 'API_ERROR',
      message: (error.response.data as any)?.message || error.message,
      details: (error.response.data as any)?.details,
    }
  }
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: error.message || 'Network error occurred',
  }
}

// API wrapper functions
export const apiClient = {
  // Auth
  auth: {
    getOAuthUrl: () => client.get('/auth/discord/url'),
    callback: (code: string) => client.get(`/auth/discord/callback?code=${code}`),
    me: () => client.get('/auth/me'),
    logout: () => client.post('/auth/logout'),
  },

  // Guilds
  guilds: {
    list: () => client.get('/guilds'),
    get: (guildId: string) => client.get(`/guilds/${guildId}`),
    update: (guildId: string, data: any) => client.put(`/guilds/${guildId}`, data),
    channels: (guildId: string) => client.get(`/guilds/${guildId}/channels`),
    permissions: (guildId: string) => client.get(`/guilds/${guildId}/permissions`),
  },

  // Welcome Banners
  welcomeBanners: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/welcome`),
    create: (guildId: string, data: FormData) =>
      client.post(`/guilds/${guildId}/welcome`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (guildId: string, bannerId: number, data: any) =>
      client.put(`/guilds/${guildId}/welcome/${bannerId}`, data),
    delete: (guildId: string, bannerId: number) => client.delete(`/guilds/${guildId}/welcome/${bannerId}`),
    preview: (guildId: string, data: any) => client.post(`/guilds/${guildId}/welcome/preview`, data),
  },

  // Leave Banners
  leaveBanners: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/leave`),
    create: (guildId: string, data: FormData) =>
      client.post(`/guilds/${guildId}/leave`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (guildId: string, bannerId: number, data: any) =>
      client.put(`/guilds/${guildId}/leave/${bannerId}`, data),
    delete: (guildId: string, bannerId: number) => client.delete(`/guilds/${guildId}/leave/${bannerId}`),
  },

  // Broadcasts
  broadcasts: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/broadcasts`),
    create: (guildId: string, data: FormData) =>
      client.post(`/guilds/${guildId}/broadcast`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    queue: () => client.get('/broadcasts/queue'),
  },

  // Media
  media: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/media`),
    upload: (guildId: string, file: FormData, onProgress?: (progress: number) => void) =>
      client.post(`/guilds/${guildId}/media`, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      }),
    delete: (guildId: string, mediaId: number) => client.delete(`/guilds/${guildId}/media/${mediaId}`),
  },

  // Minecraft
  minecraft: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/minecraft`),
    create: (guildId: string, data: any) => client.post(`/guilds/${guildId}/minecraft`, data),
    update: (guildId: string, serverId: number, data: any) =>
      client.put(`/guilds/${guildId}/minecraft/${serverId}`, data),
    delete: (guildId: string, serverId: number) => client.delete(`/guilds/${guildId}/minecraft/${serverId}`),
    status: (address: string, type: 'java' | 'bedrock') =>
      client.get('/status', { params: { address, type } }),
    summary: () => client.get('/status/minecraft/summary'),
  },

  // Moderation
  moderation: {
    logs: (guildId: string, params?: any) => client.get(`/guilds/${guildId}/moderation/logs`, { params }),
    action: (guildId: string, data: any) => client.post(`/guilds/${guildId}/moderation/action`, data),
  },

  // XP
  xp: {
    leaderboard: (guildId: string, limit = 50, range?: string) =>
      client.get(`/guilds/${guildId}/xp/top`, { params: { limit, range } }),
    increment: (guildId: string, data: any) => client.post(`/guilds/${guildId}/xp/increment`, data),
  },

  // Vote Links
  vote: {
    list: (guildId: string) => client.get(`/guilds/${guildId}/vote`),
    create: (guildId: string, data: any) => client.post(`/guilds/${guildId}/vote`, data),
    delete: (guildId: string, linkId: number) => client.delete(`/guilds/${guildId}/vote/${linkId}`),
  },

  // Health
  health: {
    status: () => client.get('/status/health'),
    bot: () => client.get('/status/bot'),
  },
}

export default client
