import { apiClient } from '../../lib/api-client'

export type UserSessionStatus =
  | 'active'
  | 'idle'
  | 'expired'
  | 'logged_out'
  | 'revoked'

export interface UserSession {
  session_id: string
  user_id: number
  username: string
  email: string
  role: string
  login_at: string
  last_seen_at: string | null
  logout_at: string | null
  expires_at: string
  ip_address: string | null
  country: string | null
  region: string | null
  city: string | null
  location: string | null
  browser: string | null
  operating_system: string | null
  device_type: string | null
  user_agent: string | null
  status: UserSessionStatus
  revoked: boolean
}

export interface RevokeSessionResponse {
  message: string
  session_id: string
  status: 'revoked'
}

export async function getUserSessions() {
  const { data } = await apiClient.get<UserSession[]>(
    '/api/admin/sessions',
  )

  return data
}

export async function revokeUserSession(sessionId: string) {
  const { data } = await apiClient.post<RevokeSessionResponse>(
    `/api/admin/sessions/${encodeURIComponent(sessionId)}/revoke`,
  )

  return data
}