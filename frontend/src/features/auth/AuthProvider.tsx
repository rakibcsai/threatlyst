import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setUnauthorizedHandler } from '../../lib/api-client'
import { authStorage } from '../../lib/auth-storage'
import type { LoginCredentials, User } from '../../types/auth'
import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
} from './auth-api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const clearLocalAuth = useCallback(() => {
    authStorage.clear()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Local logout must still succeed even if the
      // backend logout request fails or the token has
      // already expired.
    } finally {
      clearLocalAuth()
    }
  }, [clearLocalAuth])

  useEffect(() => {
    setUnauthorizedHandler(clearLocalAuth)

    return () => {
      setUnauthorizedHandler(undefined)
    }
  }, [clearLocalAuth])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)

    try {
      const token = await loginRequest(credentials)

      authStorage.set(token.access_token)

      try {
        const profile = await getCurrentUser()
        setUser(profile)
      } catch (error) {
        authStorage.clear()
        throw error
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}