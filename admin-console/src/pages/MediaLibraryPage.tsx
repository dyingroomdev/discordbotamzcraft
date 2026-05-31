import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { fetchApiBlobUrl } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { ArrowUpTrayIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface Media {
  id: number
  filename: string
  path: string
  mime: string
  uploaded_at: string
}

function MediaPreviewImage({ src, alt }: { src: string; alt: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let loadedUrl: string | null = null

    fetchApiBlobUrl(src)
      .then((url) => {
        loadedUrl = url
        if (active) setObjectUrl(url)
      })
      .catch(() => {
        if (active) setObjectUrl(null)
      })

    return () => {
      active = false
      if (loadedUrl) URL.revokeObjectURL(loadedUrl)
    }
  }, [src])

  if (!objectUrl) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-background-secondary">
        <PhotoIcon className="w-12 h-12 text-text-secondary" />
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className="w-full h-40 object-cover" />
}

export default function MediaLibraryPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', guildId],
    queryFn: async () => {
      const { data } = await apiClient.media.list(guildId)
      return data as Media[]
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      return await apiClient.media.delete(guildId, mediaId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', guildId] })
    }
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await apiClient.media.upload(guildId, formData)
      queryClient.invalidateQueries({ queryKey: ['media', guildId] })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg cursor-pointer transition-colors">
          <ArrowUpTrayIcon className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {media?.length === 0 ? (
        <div className="bg-background-primary border border-background-tertiary rounded-lg p-12 text-center">
          <PhotoIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No media files uploaded</p>
          <p className="text-sm text-text-secondary mt-1">Upload images or videos to use in banners and broadcasts</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media?.map((item) => (
            <div
              key={item.id}
              className="relative bg-background-primary border border-background-tertiary rounded-lg overflow-hidden group"
            >
              {item.mime.startsWith('image/') ? (
                <MediaPreviewImage src={`/api${item.path}`} alt={item.filename} />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-background-secondary">
                  <PhotoIcon className="w-12 h-12 text-text-secondary" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs text-text-secondary truncate">{item.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
