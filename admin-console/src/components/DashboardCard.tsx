import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline'
import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  isLoading?: boolean
  error?: Error | null
  onRefresh?: () => void
  onViewDetails?: () => void
}

export default function DashboardCard({
  title,
  icon,
  children,
  isLoading,
  error,
  onRefresh,
  onViewDetails,
}: DashboardCardProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-discord-red/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        <div className="text-discord-red text-sm">
          <p>Failed to load data</p>
          <p className="text-xs text-gray-400 mt-1">{error.message}</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="mt-4 btn-secondary text-sm py-2">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-background-tertiary rounded transition"
              title="Refresh"
            >
              <ArrowPathIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="p-1.5 hover:bg-background-tertiary rounded transition"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
