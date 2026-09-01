import { apiClient } from '../../lib/api-client'
import type { SecurityReportResponse } from './report-types'

export async function getSecurityReport() {
  const { data } = await apiClient.get<SecurityReportResponse>(
    '/api/reports/security-summary',
  )
  return data
}
