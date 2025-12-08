import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface GuildSettings {
  guild_id: string
  prefix: string
  xp_enabled: boolean
  xp_rate: number
  welcome_enabled: boolean
  leave_enabled: boolean
  moderation_log_channel?: string
}

export default function SettingsPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<GuildSettings>>({})

  const { isLoading, refetch } = useQuery({
    queryKey: ['guild-settings', guildId],
    queryFn: async () => {
      const { data } = await apiClient.guilds.get(guildId)
      setFormData(data)
      return data as GuildSettings
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<GuildSettings>) => {
      const { data } = await apiClient.guilds.update(guildId, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-settings', guildId] })
    }
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-background-secondary h-20 rounded-lg" />
        <div className="animate-pulse bg-background-secondary h-20 rounded-lg" />
        <div className="animate-pulse bg-background-secondary h-20 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guild Settings</h1>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-background-primary border border-background-tertiary rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.xp_enabled ?? false}
            onChange={(e) => setFormData({ ...formData, xp_enabled: e.target.checked })}
            className="w-5 h-5 rounded border-background-tertiary bg-background-secondary checked:bg-brand-primary focus:ring-2 focus:ring-brand-primary"
          />
          <div>
            <h3 className="font-medium">XP System</h3>
            <p className="text-sm text-text-secondary">Enable XP tracking for members</p>
          </div>
        </div>

        {formData.xp_enabled && (
          <div>
            <label className="block text-sm font-medium mb-2">XP Rate (per message)</label>
            <input
              type="number"
              value={formData.xp_rate || 10}
              onChange={(e) => setFormData({ ...formData, xp_rate: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              min={1}
              max={100}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.welcome_enabled ?? false}
            onChange={(e) => setFormData({ ...formData, welcome_enabled: e.target.checked })}
            className="w-5 h-5 rounded border-background-tertiary bg-background-secondary checked:bg-brand-primary focus:ring-2 focus:ring-brand-primary"
          />
          <div>
            <h3 className="font-medium">Welcome Messages</h3>
            <p className="text-sm text-text-secondary">Send welcome banners when members join</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.leave_enabled ?? false}
            onChange={(e) => setFormData({ ...formData, leave_enabled: e.target.checked })}
            className="w-5 h-5 rounded border-background-tertiary bg-background-secondary checked:bg-brand-primary focus:ring-2 focus:ring-brand-primary"
          />
          <div>
            <h3 className="font-medium">Leave Messages</h3>
            <p className="text-sm text-text-secondary">Send leave banners when members leave</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Moderation Log Channel ID</label>
          <input
            type="text"
            value={formData.moderation_log_channel || ''}
            onChange={(e) => setFormData({ ...formData, moderation_log_channel: e.target.value })}
            placeholder="Enter channel ID"
            className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <p className="text-xs text-text-secondary mt-1">Channel where moderation actions will be logged</p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="text-sm text-green-500">Settings saved successfully!</div>
      )}
    </div>
  )
}
