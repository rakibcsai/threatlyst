export const alertStatuses = [
  'open',
  'investigating',
  'resolved',
  'closed',
] as const

export type AlertStatus = (typeof alertStatuses)[number]

export interface AlertCreate {
  event_id: string
  title: string
  severity: string
  description: string
}

export interface AlertUpdate {
  status?: AlertStatus | null
  assigned_to_user_id?: number | null
}

export interface AlertResponse {
  id: number
  event_id: string
  title: string
  severity: string
  status: AlertStatus
  description: string
  assigned_to_user_id: number | null
  created_at: string
  updated_at: string
}
