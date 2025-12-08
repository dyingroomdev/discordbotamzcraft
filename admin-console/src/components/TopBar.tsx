import { useLocation, Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import UserMenu from './UserMenu'
import BotStatus from './BotStatus'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/overview': 'Dashboard',
  '/health': 'System Health',
  '/community/welcome': 'Welcome Banners',
  '/community/leave': 'Leave Banners',
  '/community/broadcasts': 'Broadcasts',
  '/community/media': 'Media Library',
  '/game/minecraft': 'Minecraft Servers',
  '/game/minecraft/status': 'Server Status',
  '/moderation/logs': 'Moderation Logs',
  '/analytics/xp': 'XP Leaderboard',
  '/settings': 'Guild Settings',
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return <span className="text-gray-400">Home</span>
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link to="/" className="text-gray-400 hover:text-brand-accent transition">
        Home
      </Link>
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/')
        const isLast = index === segments.length - 1
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)
        
        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-gray-400 hover:text-brand-accent transition">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TopBar() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'Admin Console'

  return (
    <header className="bg-background-secondary border-b border-gray-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <Breadcrumbs pathname={location.pathname} />
        </div>
        <div className="flex items-center gap-4">
          <BotStatus />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
