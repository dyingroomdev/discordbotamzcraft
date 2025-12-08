import { useState } from 'react'
import { useGuild } from '@/lib/guild'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function GuildSwitcher() {
  const { currentGuild, guilds, setGuildId } = useGuild()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background-secondary hover:bg-background-tertiary rounded-lg transition-colors w-full"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">{currentGuild.name}</div>
          <div className="text-xs text-text-secondary">Server</div>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-background-primary border border-background-tertiary rounded-lg shadow-elevated overflow-hidden z-20">
            {guilds.map((guild) => (
              <button
                key={guild.id}
                onClick={() => {
                  setGuildId(guild.id)
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-background-secondary transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium">{guild.name}</div>
                  <div className="text-xs text-text-secondary">{guild.id}</div>
                </div>
                {currentGuild.id === guild.id && (
                  <CheckIcon className="w-5 h-5 text-brand-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
