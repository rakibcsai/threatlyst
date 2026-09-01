import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotification,
  getNotifications,
  markNotificationRead,
} from './notifications-api'

export const notificationKeys = {
  all: ['notifications'] as const,
  detail: (id: number) => ['notifications', id] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => getNotifications(100),
  })
}

export function useNotification(id: number | null) {
  return useQuery({
    queryKey: notificationKeys.detail(id ?? 0),
    queryFn: () => getNotification(id as number),
    enabled: id !== null,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async (notification) => {
      client.setQueryData(
        notificationKeys.detail(notification.id),
        notification,
      )
      await client.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
