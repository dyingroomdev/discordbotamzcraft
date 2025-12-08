import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export default function BotStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['bot-status'],
    queryFn: async () => {
      const { data } = await apiClient.health.bot()
      return data
    },
    refetchInterval: 30000, // Refetch every 30s
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background-tertiary rounded-full">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400">Checking...</span>
      </div>
    )
  }

  const isConnected = data?.online === true

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
        isConnected ? 'bg-discord-green/20' : 'bg-discord-red/20'
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-discord-green animate-pulse' : 'bg-discord-red'
        }`}
      ></div>
      <span className={`text-xs font-medium ${isConnected ? 'text-discord-green' : 'text-discord-red'}`}>
        {isConnected ? 'Bot Connected' : 'Bot Offline'}
      </span>
    </div>
  )
}
