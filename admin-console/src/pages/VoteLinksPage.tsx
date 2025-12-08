import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline'

interface VoteLink {
  id: number
  url: string
  site_name: string
  rewards: string
}

export default function VoteLinksPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ url: '', site_name: '', rewards: '' })
  const queryClient = useQueryClient()

  const { data: links, isLoading } = useQuery({
    queryKey: ['vote-links', guildId],
    queryFn: async () => {
      const { data } = await apiClient.vote.list(guildId)
      return data as VoteLink[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiClient.vote.create(guildId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote-links', guildId] })
      setFormData({ url: '', site_name: '', rewards: '' })
      setShowForm(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (linkId: number) => {
      return await apiClient.vote.delete(guildId, linkId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote-links', guildId] })
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
        <h1 className="text-2xl font-bold">Vote Links</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Vote Link
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background-primary border border-background-tertiary rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Vote URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/vote"
              required
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="MinecraftServers.org"
              required
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rewards (Optional)</label>
            <input
              type="text"
              value={formData.rewards}
              onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
              placeholder="$5 in-game currency"
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Vote Link'}
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
        {links?.length === 0 ? (
          <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
            <LinkIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
            <p className="text-text-secondary">No vote links configured</p>
            <p className="text-sm text-text-secondary mt-1">Add vote links to let users vote for your server</p>
          </div>
        ) : (
          links?.map((link) => (
            <div
              key={link.id}
              className="bg-background-primary border border-background-tertiary rounded-lg p-4 hover:border-brand-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{link.site_name}</h3>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary hover:underline break-all"
                  >
                    {link.url}
                  </a>
                  {link.rewards && (
                    <p className="text-sm text-text-secondary mt-2">
                      <span className="font-medium">Rewards:</span> {link.rewards}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(link.id)}
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
