import { apiClient } from '../../lib/api-client'
import type { LoginCredentials, TokenResponse, User } from '../../types/auth'

export async function loginRequest(credentials: LoginCredentials) {
  const { data } = await apiClient.post<TokenResponse>(
    '/api/auth/login',
    credentials,
  )

  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<User>('/api/auth/me')

  return data
}

export async function logoutRequest() {
  await apiClient.post('/api/auth/logout')
}