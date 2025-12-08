import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import client from '@/services/api'
import { useGuild } from '@/lib/guild'
import { PlusIcon, MegaphoneIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Broadcast {
  id: number
  content: string
  created_at: string
}

interface Channel {
  id: string
  name: string
}

export default function BroadcastsPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ content: '', channel_ids: [] as string[] })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts', guildId],
    queryFn: async () => {
      const { data } = await apiClient.broadcasts.list(guildId)
      return data as Broadcast[]
    }
  })

  const { data: channels } = useQuery({
    queryKey: ['discord-channels', guildId],
    queryFn: async () => {
      const { data } = await client.get(`/guilds/${guildId}/discord-channels`)
      return data as Channel[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData()
      formDataObj.append('content', formData.content)
      formDataObj.append('channel_ids', formData.channel_ids.join(','))
      if (mediaFile) {
        formDataObj.append('media', mediaFile)
      }
      return await apiClient.broadcasts.create(guildId, formDataObj)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts', guildId] })
      setFormData({ content: '', channel_ids: [] })
      setMediaFile(null)
      setMediaPreview(null)
      setShowForm(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (broadcastId: number) => {
      return await client.delete(`/guilds/${guildId}/broadcasts/${broadcastId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts', guildId] })
    }
  })

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setMediaPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggleChannel = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      channel_ids: prev.channel_ids.includes(channelId)
        ? prev.channel_ids.filter(id => id !== channelId)
        : [...prev.channel_ids, channelId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-24 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Broadcasts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Broadcast
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background-primary border border-background-tertiary rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '@everyone' })} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium">@everyone</button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '@here' })} className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium">@here</button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '**bold**' })} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Bold</button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '*italic*' })} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Italic</button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '~~strikethrough~~' })} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Strike</button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '`code`' })} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Code</button>
            </div>
            <div className="flex gap-2 mb-2">
              <label className="text-xs font-medium">Mention Channel:</label>
              <select onChange={(e) => e.target.value && setFormData({ ...formData, content: formData.content + `<#${e.target.value}>` })} className="px-2 py-1 bg-background-secondary border border-background-tertiary rounded text-xs">
                <option value="">Select channel...</option>
                {channels?.map((ch) => (
                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                ))}
              </select>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your broadcast message...\n\nSupports Discord markdown:\n**bold** *italic* ~~strikethrough~~ `code`"
              required
              rows={6}
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Media (Optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {mediaPreview && (
              <div className="mt-2">
                <img src={mediaPreview} alt="Preview" className="max-h-40 rounded-lg" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Channels</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {channels?.map((channel) => (
                <label key={channel.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channel_ids.includes(channel.id)}
                    onChange={() => toggleChannel(channel.id)}
                    className="w-4 h-4 rounded border-background-tertiary bg-background-secondary checked:bg-brand-primary"
                  />
                  <span className="text-sm">#{channel.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-1">Select channels to broadcast to</p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {createMutation.isPending ? 'Sending...' : 'Send Broadcast'}
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
        {broadcasts?.length === 0 ? (
          <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
            <MegaphoneIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
            <p className="text-text-secondary">No broadcasts sent</p>
            <p className="text-sm text-text-secondary mt-1">Create a broadcast to send messages to multiple channels</p>
          </div>
        ) : (
          broadcasts?.map((broadcast) => (
            <div
              key={broadcast.id}
              className="bg-background-primary border border-background-tertiary rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm mb-2">{broadcast.content}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(broadcast.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(broadcast.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  title="Delete broadcast"
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
