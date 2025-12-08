import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  HomeIcon, 
  UsersIcon, 
  ServerIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface BotStatus {
  online: boolean;
  guilds: number;
  latency: number;
}

interface APIHealth {
  status: string;
  database: string;
  redis: string;
}

interface MinecraftSummary {
  total_servers: number;
  online_servers: number;
  total_players: number;
}

const fetchBotStatus = async (): Promise<BotStatus> => {
  const res = await fetch(`${API_BASE}/api/status/bot`);
  if (!res.ok) throw new Error('Failed to fetch bot status');
  return res.json();
};

const fetchAPIHealth = async (): Promise<APIHealth> => {
  const res = await fetch(`${API_BASE}/api/status/health`);
  if (!res.ok) throw new Error('Failed to fetch API health');
  return res.json();
};

const fetchMinecraftSummary = async (): Promise<MinecraftSummary> => {
  const res = await fetch(`${API_BASE}/api/status/minecraft/summary`);
  if (!res.ok) throw new Error('Failed to fetch Minecraft summary');
  return res.json();
};

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-background-secondary rounded ${className}`} />
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-background-primary border border-background-tertiary rounded-lg p-6 shadow-card ${className}`}>
    {children}
  </div>
);

export default function Overview() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: botStatus, isLoading: botLoading, refetch: refetchBot } = useQuery({
    queryKey: ['botStatus'],
    queryFn: fetchBotStatus,
    refetchInterval: 30000
  });

  const { data: apiHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: fetchAPIHealth,
    refetchInterval: 30000
  });

  const { data: mcSummary, isLoading: mcLoading, refetch: refetchMC } = useQuery({
    queryKey: ['minecraftSummary'],
    queryFn: fetchMinecraftSummary,
    refetchInterval: 60000
  });

  const navItems = [
    { icon: HomeIcon, label: 'Overview', active: true },
    { icon: UsersIcon, label: 'Community' },
    { icon: ServerIcon, label: 'Minecraft' },
    { icon: ShieldCheckIcon, label: 'Moderation' },
    { icon: ChartBarIcon, label: 'Analytics' },
    { icon: Cog6ToothIcon, label: 'Settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-background-base text-text-primary">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background-primary border-r border-background-tertiary transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-background-tertiary flex items-center justify-between">
          {!sidebarCollapsed && <h1 className="text-xl font-bold text-brand-primary">Admin</h1>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 hover:bg-background-secondary rounded">
            {sidebarCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                item.active ? 'bg-brand-primary text-white' : 'hover:bg-background-secondary'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background-primary border-b border-background-tertiary px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <UserCircleIcon className="w-6 h-6" />
              <span className="text-sm">Admin</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background-primary border border-background-tertiary rounded-lg shadow-elevated overflow-hidden z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background-secondary transition-colors text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bot Status Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bot Status</h3>
                <button onClick={() => refetchBot()} className="p-1 hover:bg-background-secondary rounded">
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              {botLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${botStatus?.online ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-text-secondary">{botStatus?.online ? 'Online' : 'Offline'}</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-primary">{botStatus?.guilds || 0}</div>
                    <div className="text-sm text-text-secondary">Guilds</div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Latency: <span className="text-text-primary font-medium">{botStatus?.latency || 0}ms</span>
                  </div>
                </div>
              )}
            </Card>

            {/* API Health Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">API Health</h3>
                <button onClick={() => refetchHealth()} className="p-1 hover:bg-background-secondary rounded">
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              {healthLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Status</span>
                    <span className={`text-sm font-medium ${apiHealth?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                      {apiHealth?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Database</span>
                    <span className={`text-sm font-medium ${apiHealth?.database === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                      {apiHealth?.database || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Redis</span>
                    <span className={`text-sm font-medium ${apiHealth?.redis === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                      {apiHealth?.redis || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Minecraft Summary Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Minecraft</h3>
                <button onClick={() => refetchMC()} className="p-1 hover:bg-background-secondary rounded">
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
              {mcLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-brand-primary">{mcSummary?.total_servers || 0}</div>
                    <div className="text-sm text-text-secondary">Total Servers</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Online</span>
                    <span className="text-green-500 font-medium">{mcSummary?.online_servers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Total Players</span>
                    <span className="text-text-primary font-medium">{mcSummary?.total_players || 0}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
