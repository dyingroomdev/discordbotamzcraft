export default function HealthPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-gray-400 text-sm font-medium mb-2">API Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-discord-green rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-discord-green">Healthy</span>
          </div>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Database</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-discord-green rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-discord-green">Connected</span>
          </div>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Redis</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-discord-green rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-discord-green">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}
