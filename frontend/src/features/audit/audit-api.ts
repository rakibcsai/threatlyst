import { apiClient } from '../../lib/api-client'
import type { AuditLogResponse } from './audit-types'

const basePath = '/api/audit-logs'

export async function getAuditLogs(limit = 100) {
  const { data } = await apiClient.get<AuditLogResponse[]>(basePath, {
    params: { limit },
  })
  return data
}

export async function getAuditLog(id: number) {
  const { data } = await apiClient.get<AuditLogResponse>(`${basePath}/${id}`)
  return data
}
