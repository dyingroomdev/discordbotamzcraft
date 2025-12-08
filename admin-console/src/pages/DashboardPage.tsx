import { useState } from 'react'
import { ServerIcon, HeartIcon, SignalIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import DashboardCard from '@/components/DashboardCard'
import DetailModal from '@/components/DetailModal'
import { useBotStatus, useAPIHealth, useMinecraftSummary, useBroadcastQueue } from '@/hooks/useDashboard'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; title: string; data: any }>({
    isOpen: false,
    title: '',
    data: null,
  })

  const botStatus = useBotStatus()
  const apiHealth = useAPIHealth()
  const minecraftSummary = useMinecraftSummary()
  const broadcastQueue = useBroadcastQueue()

  const openDetails = (title: string, data: any) => {
    setDetailModal({ isOpen: true, title, data })
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Bot Status"
          icon={<ServerIcon className="w-5 h-5 text-discord-blurple" />}
          isLoading={botStatus.isLoading}
          error={botStatus.error}
          onRefresh={() => botStatus.refetch()}
          onViewDetails={() => openDetails('Bot Status Details', botStatus.data)}
        >
          {botStatus.data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="badge-success">{botStatus.data.status || 'Online'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white">
                  {botStatus.data.uptime
                    ? formatDistanceToNow(new Date(Date.now() - botStatus.data.uptime * 1000))
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shards</span>
                <span className="text-white">{botStatus.data.shards || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Heartbeat</span>
                <span className="text-white">
                  {botStatus.data.lastHeartbeat
                    ? formatDistanceToNow(new Date(botStatus.data.lastHeartbeat), { addSuffix: true })
                    : 'Just now'}
                </span>
              </div>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="API Health"
          icon={<HeartIcon className="w-5 h-5 text-discord-green" />}
          isLoading={apiHealth.isLoading}
          error={apiHealth.error}
          onRefresh={() => apiHealth.refetch()}
          onViewDetails={() => openDetails('API Health Details', apiHealth.data)}
        >
          {apiHealth.data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="badge-success">{apiHealth.data.status || 'Healthy'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latency</span>
                <span className="text-white">{apiHealth.data.latency || '< 10'}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-white">{apiHealth.data.errorRate || '0.0'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Requests/min</span>
                <span className="text-white">{apiHealth.data.requestsPerMin || '0'}</span>
              </div>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Minecraft Cluster"
          icon={<SignalIcon className="w-5 h-5 text-brand-accent" />}
          isLoading={minecraftSummary.isLoading}
          error={minecraftSummary.error}
          onRefresh={() => minecraftSummary.refetch()}
          onViewDetails={() => openDetails('Minecraft Cluster Details', minecraftSummary.data)}
        >
          {minecraftSummary.data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Online Servers</span>
                <span className="text-discord-green font-semibold">
                  {minecraftSummary.data.onlineServers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Players</span>
                <span className="text-white font-semibold">{minecraftSummary.data.totalPlayers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Problematic</span>
                <span className="text-discord-red font-semibold">
                  {minecraftSummary.data.problematicServers?.length || 0}
                </span>
              </div>
              {minecraftSummary.data.problematicServers?.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {minecraftSummary.data.problematicServers.slice(0, 2).map((server: string) => (
                    <div key={server} className="badge-error mt-1">
                      {server}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Broadcast Queue"
          icon={<MegaphoneIcon className="w-5 h-5 text-discord-yellow" />}
          isLoading={broadcastQueue.isLoading}
          error={broadcastQueue.error}
          onRefresh={() => broadcastQueue.refetch()}
          onViewDetails={() => openDetails('Broadcast Queue Details', broadcastQueue.data)}
        >
          {broadcastQueue.data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending</span>
                <span className="text-discord-yellow font-semibold text-2xl">
                  {broadcastQueue.data.pending || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processing</span>
                <span className="text-white">{broadcastQueue.data.processing || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed Today</span>
                <span className="text-discord-green">{broadcastQueue.data.completedToday || 0}</span>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, title: '', data: null })}
        title={detailModal.title}
      >
        <pre className="bg-background-tertiary p-4 rounded-lg overflow-auto max-h-96 text-sm text-gray-300">
          {JSON.stringify(detailModal.data, null, 2)}
        </pre>
      </DetailModal>
    </div>
  )
}
