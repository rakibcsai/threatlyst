import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardStatsQueryKey } from '../dashboard/useDashboardStats'
import { getEvents, submitEvent } from './events-api'

export const eventsQueryKey = ['events'] as const

export function useEvents() {
  return useQuery({ queryKey: eventsQueryKey, queryFn: getEvents })
}

export function useSubmitEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitEvent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsQueryKey }),
        queryClient.invalidateQueries({ queryKey: dashboardStatsQueryKey }),
      ])
    },
  })
}
