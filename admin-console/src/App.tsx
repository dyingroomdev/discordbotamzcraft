import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { GuildProvider } from './lib/guild'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/ui/Toast'
import { CommandPalette } from './components/ui/CommandPalette'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'

// Lazy-loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const HealthPage = lazy(() => import('./pages/HealthPage'))
const WelcomeBannersPage = lazy(() => import('./pages/WelcomeBannersPage'))
const LeaveBannersPage = lazy(() => import('./pages/LeaveBannersPage'))
const BroadcastsPage = lazy(() => import('./pages/BroadcastsPage'))
const MediaLibraryPage = lazy(() => import('./pages/MediaLibraryPage'))
const MinecraftServersPage = lazy(() => import('./pages/MinecraftServersPage'))
const ServerStatusPage = lazy(() => import('./pages/ServerStatusPage'))
const VoteLinksPage = lazy(() => import('./pages/VoteLinksPage'))
const ModerationLogsPage = lazy(() => import('./pages/ModerationLogsPage'))
const XPLeaderboardPage = lazy(() => import('./pages/XPLeaderboardPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <GuildProvider>
          <CommandPalette />
          <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="overview"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="health"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HealthPage />
              </Suspense>
            }
          />
          <Route
            path="community/welcome"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <WelcomeBannersPage />
              </Suspense>
            }
          />
          <Route
            path="community/leave"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LeaveBannersPage />
              </Suspense>
            }
          />
          <Route
            path="community/broadcasts"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BroadcastsPage />
              </Suspense>
            }
          />
          <Route
            path="community/media"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <MediaLibraryPage />
              </Suspense>
            }
          />
          <Route
            path="game/minecraft"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <MinecraftServersPage />
              </Suspense>
            }
          />
          <Route
            path="game/minecraft/status"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ServerStatusPage />
              </Suspense>
            }
          />
          <Route
            path="game/vote"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <VoteLinksPage />
              </Suspense>
            }
          />
          <Route
            path="moderation/logs"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ModerationLogsPage />
              </Suspense>
            }
          />
          <Route
            path="analytics/xp"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <XPLeaderboardPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
          </Routes>
        </GuildProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
