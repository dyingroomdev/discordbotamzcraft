import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function useBotStatus() {
  return useQuery({
    queryKey: ['bot-status'],
    queryFn: async () => {
      const { data } = await apiClient.health.bot()
      return data
    },
    refetchInterval: 10000,
  })
}

export function useAPIHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const { data } = await apiClient.health.status()
      return data
    },
    refetchInterval: 10000,
  })
}

export function useMinecraftSummary() {
  return useQuery({
    queryKey: ['minecraft-summary'],
    queryFn: async () => {
      const { data } = await apiClient.minecraft.summary()
      return data
    },
    refetchInterval: 10000,
  })
}

export function useBroadcastQueue() {
  return useQuery({
    queryKey: ['broadcast-queue'],
    queryFn: async () => {
      const { data } = await apiClient.broadcasts.queue()
      return data
    },
    refetchInterval: 10000,
  })
}
