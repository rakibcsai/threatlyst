import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardStatsQueryKey } from '../dashboard/useDashboardStats'
import { createAlert, getAlert, getAlerts, updateAlert } from './alerts-api'

export const alertKeys = {
  all: ['alerts'] as const,
  detail: (alertId: number) => ['alerts', alertId] as const,
}

export function useAlerts() {
  return useQuery({ queryKey: alertKeys.all, queryFn: getAlerts })
}

export function useAlert(alertId: number | null) {
  return useQuery({
    queryKey: alertKeys.detail(alertId ?? 0),
    queryFn: () => getAlert(alertId as number),
    enabled: alertId !== null,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAlert,
    onSuccess: async (alert) => {
      queryClient.setQueryData(alertKeys.detail(alert.id), alert)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: alertKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      ])
    },
  })
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAlert,
    onSuccess: async (alert) => {
      queryClient.setQueryData(alertKeys.detail(alert.id), alert)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: alertKeys.all }),
        queryClient.invalidateQueries({ queryKey: alertKeys.detail(alert.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      ])
    },
  })
}
