import LoginButton from '@/components/LoginButton'
import { useAuth } from '@/lib/auth'
import { Navigate } from 'react-router-dom'
import logoUrl from '@/assets/logo.png'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050805] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(82,153,31,0.18),transparent_42%),linear-gradient(180deg,rgba(88,101,242,0.08),transparent_48%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-lg border border-white/10 bg-black/50 shadow-2xl shadow-black/50 backdrop-blur">
          <section className="hidden lg:flex min-h-[520px] flex-col justify-between border-r border-white/10 bg-gradient-to-br from-brand-forest/80 via-black to-[#111820] p-10">
            <div>
              <img src={logoUrl} alt="Amaze Gaming" className="h-20 w-auto max-w-[320px] object-contain object-left" />
              <div className="mt-10 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-accent-light">AmzCraft Control</p>
                <h1 className="mt-4 text-4xl font-bold leading-tight text-white">Manage the server without leaving the command deck.</h1>
                <p className="mt-4 text-base leading-7 text-gray-300">
                  Configure moderation, Minecraft status, banners, vote links, XP, and broadcasts from one private console.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-gray-400">Access</p>
                <p className="mt-1 font-semibold text-white">Owner only</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-gray-400">Auth</p>
                <p className="mt-1 font-semibold text-white">Discord</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-gray-400">API</p>
                <p className="mt-1 font-semibold text-white">Protected</p>
              </div>
            </div>
          </section>

          <section className="flex min-h-[520px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-8 lg:hidden">
                <img src={logoUrl} alt="Amaze Gaming" className="mx-auto h-16 w-auto max-w-[260px] object-contain" />
              </div>

              <div className="rounded-lg border border-white/10 bg-background-secondary/95 p-6 shadow-xl shadow-black/30 sm:p-8">
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-brand-accent-light">
                    <span className="h-2 w-2 bg-brand-accent-light" />
                    Secure dashboard
                  </div>
                  <h2 className="text-2xl font-bold text-white">Sign in to AmzCraft</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Use the Discord account that owns or administers the AmzCraft server.
                  </p>
                </div>

                <LoginButton className="w-full !bg-none !bg-discord-blurple hover:!bg-[#4752c4] shadow-discord-blurple/20" />

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs leading-5 text-gray-500">
                    Access is checked against your Discord server permissions before the console opens.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
