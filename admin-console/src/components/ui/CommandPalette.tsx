import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const commands = [
  { name: 'Dashboard', path: '/overview', keywords: ['home', 'overview'] },
  { name: 'Health', path: '/health', keywords: ['status', 'health'] },
  { name: 'Welcome Banners', path: '/community/welcome', keywords: ['welcome', 'banners'] },
  { name: 'Leave Banners', path: '/community/leave', keywords: ['leave', 'banners'] },
  { name: 'Broadcasts', path: '/community/broadcasts', keywords: ['broadcast', 'announce'] },
  { name: 'Media Library', path: '/community/media', keywords: ['media', 'files', 'images'] },
  { name: 'Minecraft Servers', path: '/game/minecraft', keywords: ['minecraft', 'servers'] },
  { name: 'Server Status', path: '/game/minecraft/status', keywords: ['status', 'minecraft'] },
  { name: 'Moderation Logs', path: '/moderation/logs', keywords: ['moderation', 'logs', 'mod'] },
  { name: 'XP Leaderboard', path: '/analytics/xp', keywords: ['xp', 'leaderboard', 'levels'] },
  { name: 'Settings', path: '/settings', keywords: ['settings', 'config'] },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'g' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(query.toLowerCase()) ||
          cmd.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : commands

  const handleSelect = (path: string) => {
    navigate(path)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
          <div className="flex min-h-full items-start justify-center p-4 pt-[20vh]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-background-secondary border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search commands..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 text-xs bg-background-tertiary rounded">ESC</kbd>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.path}
                      onClick={() => handleSelect(cmd.path)}
                      className="w-full px-4 py-3 text-left hover:bg-background-tertiary transition flex items-center justify-between"
                    >
                      <span className="text-sm">{cmd.name}</span>
                      <span className="text-xs text-gray-500">{cmd.path}</span>
                    </button>
                  ))}
                  {filteredCommands.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">No commands found</div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
