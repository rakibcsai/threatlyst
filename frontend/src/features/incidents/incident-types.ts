export const incidentStatuses = [
  'open',
  'investigating',
  'contained',
  'resolved',
  'closed',
] as const

export type IncidentStatus = (typeof incidentStatuses)[number]

export interface IncidentCreate {
  title: string
  description: string
  severity: string
}

export interface IncidentUpdate {
  status?: IncidentStatus | null
  assigned_to_user_id?: number | null
}

export interface IncidentResponse {
  id: number
  title: string
  description: string
  severity: string
  status: IncidentStatus
  assigned_to_user_id: number | null
  created_by_user_id: number
  created_at: string
  updated_at: string
  closed_at: string | null
}
