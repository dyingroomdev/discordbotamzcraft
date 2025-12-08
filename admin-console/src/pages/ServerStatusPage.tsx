import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface MinecraftServer {
  id: number
  name: string
  address: string
  port: number
  type: 'java' | 'bedrock'
}

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
  }
  version?: string
  motd?: string
}

export default function ServerStatusPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id

  const { data: servers, isLoading: serversLoading } = useQuery({
    queryKey: ['minecraft-servers', guildId],
    queryFn: async () => {
      const { data } = await apiClient.minecraft.list(guildId)
      return data as MinecraftServer[]
    }
  })

  const { data: statuses, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ['server-statuses', servers],
    queryFn: async () => {
      if (!servers) return {}
      const statusMap: Record<number, ServerStatus> = {}
      await Promise.all(
        servers.map(async (server) => {
          try {
            const addressWithPort = server.port && server.port !== 25565 
              ? `${server.address}:${server.port}` 
              : server.address
            const { data } = await apiClient.minecraft.status(addressWithPort, server.type)
            statusMap[server.id] = data
          } catch {
            statusMap[server.id] = { online: false }
          }
        })
      )
      return statusMap
    },
    enabled: !!servers,
    refetchInterval: 30000
  })

  if (serversLoading || statusLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Server Status</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors font-medium"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {!servers || servers.length === 0 ? (
        <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
          <p className="text-text-secondary">No servers configured</p>
          <p className="text-sm text-text-secondary mt-1">Add servers in Minecraft Servers page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servers.map((server) => {
            const status = statuses?.[server.id]
            return (
              <div
                key={server.id}
                className="bg-background-primary border border-background-tertiary rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{server.name}</h3>
                    <p className="text-sm text-text-secondary font-mono">
                      {server.address}:{server.port}
                    </p>
                  </div>
                  {status?.online ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Status</span>
                    <span className={status?.online ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {status?.online ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {status?.online && (
                    <>
                      {status.players && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Players</span>
                          <span className="font-medium">
                            {status.players.online} / {status.players.max}
                          </span>
                        </div>
                      )}
                      {status.version && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Version</span>
                          <span className="font-medium">{status.version}</span>
                        </div>
                      )}
                      {status.motd && (
                        <div className="mt-3 pt-3 border-t border-background-tertiary">
                          <p className="text-xs text-text-secondary mb-1">MOTD</p>
                          <p className="text-sm">{status.motd}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
