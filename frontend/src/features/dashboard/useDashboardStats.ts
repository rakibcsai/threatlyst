import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from './dashboard-api'

export const dashboardStatsQueryKey = ['dashboard', 'stats'] as const

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: getDashboardStats,
  })
}
