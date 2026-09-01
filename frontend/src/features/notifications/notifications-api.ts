import { apiClient } from '../../lib/api-client'
import type { NotificationResponse } from './notification-types'

const basePath = '/api/notifications'

export async function getNotifications(limit = 100) {
  const { data } = await apiClient.get<NotificationResponse[]>(basePath, {
    params: { limit },
  })
  return data
}

export async function getNotification(id: number) {
  const { data } = await apiClient.get<NotificationResponse>(
    `${basePath}/${id}`,
  )
  return data
}

export async function markNotificationRead(id: number) {
  const { data } = await apiClient.patch<NotificationResponse>(
    `${basePath}/${id}/read`,
  )
  return data
}
