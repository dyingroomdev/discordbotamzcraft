import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline'

interface MinecraftServer {
  id: number
  name: string
  address: string
  port: number
  type: 'java' | 'bedrock'
  alt_addresses?: Record<string, string>
}

export default function MinecraftServersPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    port: 25565,
    type: 'java' as 'java' | 'bedrock'
  })
  const queryClient = useQueryClient()

  const { data: servers, isLoading } = useQuery({
    queryKey: ['minecraft-servers', guildId],
    queryFn: async () => {
      const { data } = await apiClient.minecraft.list(guildId)
      return data as MinecraftServer[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiClient.minecraft.create(guildId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minecraft-servers', guildId] })
      setFormData({ name: '', address: '', port: 25565, type: 'java' })
      setShowForm(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (serverId: number) => {
      return await apiClient.minecraft.delete(guildId, serverId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minecraft-servers', guildId] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-24 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minecraft Servers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Server
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background-primary border border-background-tertiary rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Server Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Minecraft Server"
              required
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="play.example.com"
                required
                className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Port (Optional)</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 25565 })}
                placeholder="25565"
                className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Server Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'java' | 'bedrock' })}
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="java">Java Edition</option>
              <option value="bedrock">Bedrock Edition</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Server'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {servers?.length === 0 ? (
          <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
            <ServerIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
            <p className="text-text-secondary">No Minecraft servers configured</p>
            <p className="text-sm text-text-secondary mt-1">Add servers to display them in Discord</p>
          </div>
        ) : (
          servers?.map((server) => (
            <div
              key={server.id}
              className="bg-background-primary border border-background-tertiary rounded-lg p-4 hover:border-brand-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{server.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      server.type === 'java' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {server.type === 'java' ? 'Java' : 'Bedrock'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary font-mono">
                    {server.address}:{server.port}
                  </p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(server.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
