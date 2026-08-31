import { apiClient } from '../../lib/api-client'
import type { DashboardStats } from './dashboard-types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/api/dashboard/stats')
  return data
}
