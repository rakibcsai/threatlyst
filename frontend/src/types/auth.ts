export const userRoles = ['admin', 'analyst', 'viewer'] as const

export type UserRole = (typeof userRoles)[number]

export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  is_active: boolean
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}
