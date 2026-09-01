export interface AuditLogResponse {
  id: number
  user_id: number | null
  username: string | null
  action: string
  resource_type: string
  resource_id: string | null
  status: string
  details: string | null
  ip_address: string | null
  created_at: string
}
