import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import client from '@/services/api'
import { useGuild } from '@/lib/guild'
import { PhotoIcon, EyeIcon } from '@heroicons/react/24/outline'

interface Channel {
  id: string
  name: string
}

export default function WelcomeBannersPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ channel_id: '', text: '', enabled: true })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [textPreview, setTextPreview] = useState<string | null>(null)

  const { data: banners, isLoading } = useQuery({
    queryKey: ['welcome-banners', guildId],
    queryFn: async () => {
      const { data } = await apiClient.welcomeBanners.list(guildId)
      return data as any[]
    }
  })

  const { data: channels } = useQuery({
    queryKey: ['discord-channels', guildId],
    queryFn: async () => {
      const { data } = await client.get(`/guilds/${guildId}/discord-channels`)
      return data as Channel[]
    }
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const banner = banners?.[0]
      const formDataObj = new FormData()
      formDataObj.append('name', 'Welcome Banner')
      formDataObj.append('channel_id', formData.channel_id)
      formDataObj.append('text', formData.text)
      if (mediaFile) formDataObj.append('media', mediaFile)
      
      if (banner) {
        return await apiClient.welcomeBanners.update(guildId, banner.id, formData)
      } else {
        return await apiClient.welcomeBanners.create(guildId, formDataObj)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-banners', guildId] })
      setMediaFile(null)
      setMediaPreview(null)
    }
  })

  useEffect(() => {
    if (banners?.[0]) {
      setFormData({
        channel_id: String(banners[0].channel_id || ''),
        text: banners[0].text || '',
        enabled: banners[0].enabled ?? true
      })
      // Load existing media if available
      if (banners[0].media_path) {
        setMediaPreview(`http://localhost:4000${banners[0].media_path}`)
      }
    }
  }, [banners])

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setMediaPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const insertToken = (token: string) => {
    setFormData(prev => ({ ...prev, text: prev.text + token }))
  }

  const previewMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/guilds/${guildId}/welcome/preview`, { text: formData.text })
      return data
    },
    onSuccess: (data) => {
      setTextPreview(data.text)
    }
  })

  if (isLoading) {
    return <div className="animate-pulse bg-background-secondary h-64 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome Banner</h1>
      
      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="bg-background-primary border border-background-tertiary rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Channel</label>
          <select
            value={formData.channel_id}
            onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
            required
            className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Select channel</option>
            {channels?.map((ch) => (
              <option key={ch.id} value={ch.id}>#{ch.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Text Template</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => insertToken('{user_mention}')} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">@User</button>
            <button type="button" onClick={() => insertToken('{guild_name}')} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Guild</button>
            <button type="button" onClick={() => insertToken('{channel:#general}')} className="px-2 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded text-xs font-medium">Channel</button>
          </div>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Welcome {user_mention} to {guild_name}!"
            required
            rows={6}
            className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <p className="text-xs text-text-secondary mt-1">Tokens: {'{user_mention}'}, {'{guild_name}'}, {'{channel:#name}'}</p>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/80 text-white rounded text-sm transition-colors font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            Preview Text
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Media (Optional)</label>
          <input
            type="file"
            accept="image/*,image/gif"
            onChange={handleMediaChange}
            className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <p className="text-xs text-text-secondary mt-1">Supports images and GIFs</p>
        </div>

        {(textPreview || mediaPreview) && (
          <div className="p-6 bg-background-secondary border border-background-tertiary rounded-lg">
            <p className="text-xs text-text-secondary mb-4 font-semibold uppercase tracking-wide">📱 Discord Preview</p>
            <div className="bg-[#313338] rounded-lg overflow-hidden shadow-xl">
              {/* Discord message header */}
              <div className="flex items-center gap-3 p-4 bg-[#2b2d31]">
                <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">AmzCraft Bot</span>
                    <span className="bg-brand-accent text-white text-xs px-1.5 py-0.5 rounded">BOT</span>
                  </div>
                  <span className="text-xs text-gray-400">Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              {/* Message content */}
              <div className="p-4 space-y-3">
                {textPreview && (
                  <div className="text-[#dbdee1] text-sm leading-relaxed whitespace-pre-wrap">
                    {textPreview}
                  </div>
                )}
                {mediaPreview && (
                  <div className="mt-3">
                    <img 
                      src={mediaPreview} 
                      alt="Welcome Banner" 
                      className="max-w-full rounded-lg border-2 border-[#1e1f22]" 
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="w-4 h-4 rounded border-background-tertiary bg-background-secondary checked:bg-brand-primary"
          />
          <label className="text-sm">Enabled</label>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
        >          {saveMutation.isPending ? 'Saving...' : 'Save Banner'}
        </button>
      </form>
    </div>
  )
}
