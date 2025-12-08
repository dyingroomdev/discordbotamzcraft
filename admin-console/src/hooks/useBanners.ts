import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function useWelcomeBanners(guildId: string) {
  return useQuery({
    queryKey: ['welcome-banners', guildId],
    queryFn: async () => {
      const { data } = await apiClient.welcomeBanners.list(guildId)
      return data
    },
  })
}

export function useCreateWelcomeBanner(guildId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.welcomeBanners.create(guildId, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-banners', guildId] })
    },
  })
}

export function useUpdateWelcomeBanner(guildId: string, bannerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.welcomeBanners.update(guildId, bannerId, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-banners', guildId] })
    },
  })
}

export function useDeleteWelcomeBanner(guildId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bannerId: number) => {
      await apiClient.welcomeBanners.delete(guildId, bannerId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-banners', guildId] })
    },
  })
}

export function usePreviewBanner(guildId: string) {
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.welcomeBanners.preview(guildId, data)
      return result
    },
  })
}

export function useGuildChannels(guildId: string) {
  return useQuery({
    queryKey: ['guild-channels', guildId],
    queryFn: async () => {
      const { data } = await apiClient.guilds.channels(guildId)
      return data
    },
  })
}
