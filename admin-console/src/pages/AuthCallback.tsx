import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { useAuth } from '@/lib/auth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refetch } = useAuth()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      navigate('/login')
      return
    }

    // Backend exchanges code and sets HttpOnly cookie or returns JWT
    apiClient.auth
      .callback(code)
      .then((res) => {
        // If backend returns JWT, store it
        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token)
        }
        // Refetch user data
        return refetch()
      })
      .then(() => {
        navigate('/')
      })
      .catch(() => {
        navigate('/login')
      })
  }, [searchParams, navigate, refetch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
        <p className="mt-4 text-gray-400">Authenticating...</p>
      </div>
    </div>
  )
}
