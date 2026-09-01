export interface NotificationResponse {
  id: number
  user_id: number | null
  notification_type: string
  title: string
  message: string
  severity: string
  resource_type: string | null
  resource_id: string | null
  is_read: boolean
  created_at: string
  read_at: string | null
}
