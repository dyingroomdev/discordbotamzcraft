import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useCreateWelcomeBanner, useUpdateWelcomeBanner, useGuildChannels, usePreviewBanner } from '@/hooks/useBanners'
import { Fragment } from 'react'

interface BannerModalProps {
  isOpen: boolean
  onClose: () => void
  banner?: any
  guildId: string
}

export default function BannerModal({ isOpen, onClose, banner, guildId }: BannerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    channel_id: '',
    text: '',
    enabled: true,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { data: channels } = useGuildChannels(guildId)
  const createBanner = useCreateWelcomeBanner(guildId)
  const updateBanner = useUpdateWelcomeBanner(guildId, banner?.id)
  const previewBanner = usePreviewBanner(guildId)

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name,
        channel_id: banner.channel_id,
        text: banner.text,
        enabled: banner.enabled,
      })
    } else {
      setFormData({ name: '', channel_id: '', text: '', enabled: true })
    }
  }, [banner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (banner) {
      await updateBanner.mutateAsync(formData)
    } else {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('channel_id', formData.channel_id)
      data.append('text', formData.text)
      data.append('enabled', String(formData.enabled))
      if (file) data.append('media', file)
      
      await createBanner.mutateAsync(data)
    }
    onClose()
  }

  const handlePreview = async () => {
    const result = await previewBanner.mutateAsync({
      text: formData.text,
      user_mention: '@User',
      guild_name: 'Test Guild',
    })
    setPreview(result.text)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-background-secondary border border-gray-800 rounded-card-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold">
                    {banner ? 'Edit Banner' : 'Create Banner'}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 hover:bg-background-tertiary rounded">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Channel</label>
                    <select
                      value={formData.channel_id}
                      onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-accent"
                      required
                    >
                      <option value="">Select channel</option>
                      {channels?.map((ch: any) => (
                        <option key={ch.id} value={ch.id}>
                          #{ch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Text Template
                      <span className="text-xs text-gray-400 ml-2">
                        Tokens: {'{user_mention}'}, {'{guild_name}'}, {'{channel:#name}'}
                      </span>
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-accent h-32"
                      required
                    />
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="mt-2 btn-secondary text-sm py-1.5 px-3 flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Preview
                    </button>
                    {preview && (
                      <div className="mt-2 p-3 bg-background-tertiary rounded-lg text-sm">
                        {preview}
                      </div>
                    )}
                  </div>

                  {!banner && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Media (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max 10MB, images only</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Enabled</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="brand-btn">
                      {banner ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
