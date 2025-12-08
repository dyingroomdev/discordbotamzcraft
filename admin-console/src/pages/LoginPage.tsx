import LoginButton from '@/components/LoginButton'
import { useAuth } from '@/lib/auth'
import { Navigate } from 'react-router-dom'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-brand">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-brand-accent">AmzCraft</h1>
        <p className="text-gray-400 text-center mb-8">Admin Console</p>
        <LoginButton />
      </div>
    </div>
  )
}
