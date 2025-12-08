import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useGuild } from '@/lib/guild'
import { ArrowPathIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface XPEntry {
  user_id: string
  username: string
  xp: number
  level: number
  rank: number
}

export default function XPLeaderboardPage() {
  const { currentGuild } = useGuild()
  const guildId = currentGuild.id
  const [limit, setLimit] = useState(50)

  const { data: leaderboard, isLoading, refetch } = useQuery({
    queryKey: ['xp-leaderboard', guildId, limit],
    queryFn: async () => {
      const { data } = await apiClient.xp.leaderboard(guildId, limit)
      return data as XPEntry[]
    },
    refetchInterval: 30000
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-background-secondary h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">XP Leaderboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-background-primary border border-background-tertiary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-background-tertiary">
            {leaderboard?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                  No XP data available
                </td>
              </tr>
            ) : (
              leaderboard?.map((entry) => (
                <tr key={entry.user_id} className="hover:bg-background-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && (
                        <TrophyIcon
                          className={`w-5 h-5 ${
                            entry.rank === 1
                              ? 'text-yellow-500'
                              : entry.rank === 2
                              ? 'text-gray-400'
                              : 'text-orange-600'
                          }`}
                        />
                      )}
                      <span className="font-medium">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{entry.username || `User ${entry.user_id}`}</div>
                    <div className="text-sm text-text-secondary">{entry.user_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm font-medium">
                      Level {entry.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{entry.xp.toLocaleString()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
