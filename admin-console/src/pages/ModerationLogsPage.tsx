import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { ArrowPathIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

interface ModerationLog {
  id: number
  action: string
  target_user_id: string
  target_username: string
  moderator_id: string
  moderator_username: string
  reason?: string
  created_at: string
}

export default function ModerationLogsPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [actionFilter, setActionFilter] = useState('all')

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['moderation-logs', guildId, actionFilter],
    queryFn: async () => {
      const params = actionFilter !== 'all' ? { action: actionFilter } : {}
      const { data } = await apiClient.moderation.logs(guildId, params)
      return data as ModerationLog[]
    },
    refetchInterval: 30000
  })

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'ban': return 'text-red-500 bg-red-500/20'
      case 'kick': return 'text-orange-500 bg-orange-500/20'
      case 'mute': return 'text-yellow-500 bg-yellow-500/20'
      case 'warn': return 'text-blue-500 bg-blue-500/20'
      case 'unban': return 'text-green-500 bg-green-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moderation Logs</h1>
        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Actions</option>
            <option value="ban">Bans</option>
            <option value="kick">Kicks</option>
            <option value="mute">Mutes</option>
            <option value="warn">Warns</option>
            <option value="unban">Unbans</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {logs?.length === 0 ? (
          <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
            <ShieldExclamationIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
            <p className="text-text-secondary">No moderation logs found</p>
          </div>
        ) : (
          logs?.map((log) => (
            <div
              key={log.id}
              className="bg-background-primary border border-background-tertiary rounded-lg p-4 hover:border-brand-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action.toUpperCase()}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Target:</span>
                      <span className="font-medium">{log.target_username || log.target_user_id}</span>
                      <span className="text-xs text-text-secondary">({log.target_user_id})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Moderator:</span>
                      <span className="font-medium">{log.moderator_username || log.moderator_id}</span>
                      <span className="text-xs text-text-secondary">({log.moderator_id})</span>
                    </div>
                    {log.reason && (
                      <div className="flex items-start gap-2 mt-2">
                        <span className="text-sm text-text-secondary">Reason:</span>
                        <span className="text-sm">{log.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
