import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/services/api'

interface User {
  id: string
  username: string
  avatar: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    
    try {
      const { data } = await apiClient.auth.me()
      setUser(data)
    } catch (error: any) {
      setUser(null)
      if (error?.status === 401) {
        localStorage.removeItem('token')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    const { data } = await apiClient.auth.getOAuthUrl()
    window.location.href = data.url
  }

  const logout = async () => {
    await apiClient.auth.logout()
    setUser(null)
    localStorage.removeItem('token')
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
