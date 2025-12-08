import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  HeartIcon,
  UserGroupIcon,
  MegaphoneIcon,
  PhotoIcon,
  ServerIcon,
  SignalIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/overview', icon: HomeIcon },
      { name: 'Health', href: '/health', icon: HeartIcon },
    ],
  },
  {
    name: 'Community',
    items: [
      { name: 'Welcome Banners', href: '/community/welcome', icon: UserGroupIcon },
      { name: 'Leave Banners', href: '/community/leave', icon: UserGroupIcon },
      { name: 'Broadcasts', href: '/community/broadcasts', icon: MegaphoneIcon },
      { name: 'Media', href: '/community/media', icon: PhotoIcon },
    ],
  },
  {
    name: 'Game Ops',
    items: [
      { name: 'Minecraft Servers', href: '/game/minecraft', icon: ServerIcon },
      { name: 'Server Status', href: '/game/minecraft/status', icon: SignalIcon },
      { name: 'Vote Links', href: '/game/vote', icon: TrophyIcon },
    ],
  },
  {
    name: 'Moderation',
    items: [
      { name: 'Logs', href: '/moderation/logs', icon: ShieldCheckIcon },
    ],
  },
  {
    name: 'Analytics',
    items: [
      { name: 'XP Leaderboard', href: '/analytics/xp', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Settings',
    items: [
      { name: 'Guild Settings', href: '/settings', icon: Cog6ToothIcon },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-background-secondary border-r border-gray-800 min-h-screen flex flex-col transition-all duration-300`}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold text-brand-accent">AmzCraft</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-background-tertiary rounded-lg transition"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <nav className="px-3 space-y-6 flex-1 overflow-y-auto">
        {navigation.map((group) => (
          <div key={group.name}>
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.name}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-brand-accent/20 text-brand-accent'
                        : 'text-gray-300 hover:bg-background-tertiary hover:text-brand-accent'
                    }`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => {
            /* Handled by UserMenu */
          }}
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-300 hover:bg-background-tertiary hover:text-discord-red rounded-lg transition"
          title={collapsed ? 'Logout' : undefined}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
