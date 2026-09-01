import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardStatsQueryKey } from '../dashboard/useDashboardStats'
import {
  createIncident,
  getIncident,
  getIncidents,
  updateIncident,
} from './incidents-api'

export const incidentKeys = {
  all: ['incidents'] as const,
  detail: (incidentId: number) => ['incidents', incidentId] as const,
}

export function useIncidents() {
  return useQuery({ queryKey: incidentKeys.all, queryFn: getIncidents })
}

export function useIncident(incidentId: number | null) {
  return useQuery({
    queryKey: incidentKeys.detail(incidentId ?? 0),
    queryFn: () => getIncident(incidentId as number),
    enabled: incidentId !== null,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIncident,
    onSuccess: async (incident) => {
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      ])
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateIncident,
    onSuccess: async (incident) => {
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
        queryClient.invalidateQueries({
          queryKey: incidentKeys.detail(incident.id),
        }),
        queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      ])
    },
  })
}
