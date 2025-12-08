import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Guild {
  id: string
  name: string
}

const GUILDS: Guild[] = [
  { id: '1118248694236590131', name: 'AmzCraft' }
]

interface GuildContextType {
  currentGuild: Guild
  guilds: Guild[]
  setGuildId: (id: string) => void
}

const GuildContext = createContext<GuildContextType | undefined>(undefined)

export function GuildProvider({ children }: { children: ReactNode }) {
  const [currentGuildId, setCurrentGuildId] = useState<string>(() => {
    return localStorage.getItem('selected_guild_id') || GUILDS[0].id
  })

  const currentGuild = GUILDS.find(g => g.id === currentGuildId) || GUILDS[0]

  useEffect(() => {
    localStorage.setItem('selected_guild_id', currentGuildId)
  }, [currentGuildId])

  return (
    <GuildContext.Provider value={{ currentGuild, guilds: GUILDS, setGuildId: setCurrentGuildId }}>
      {children}
    </GuildContext.Provider>
  )
}

export function useGuild() {
  const context = useContext(GuildContext)
  if (!context) {
    throw new Error('useGuild must be used within GuildProvider')
  }
  return context
}
