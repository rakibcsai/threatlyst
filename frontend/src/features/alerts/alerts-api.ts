import { apiClient } from '../../lib/api-client'
import type { AlertCreate, AlertResponse, AlertUpdate } from './alert-types'

export async function getAlerts() {
  const { data } = await apiClient.get<AlertResponse[]>('/api/alerts')
  return data
}

export async function getAlert(alertId: number) {
  const { data } = await apiClient.get<AlertResponse>(`/api/alerts/${alertId}`)
  return data
}

export async function createAlert(alert: AlertCreate) {
  const { data } = await apiClient.post<AlertResponse>('/api/alerts', alert)
  return data
}

export async function updateAlert({
  alertId,
  update,
}: {
  alertId: number
  update: AlertUpdate
}) {
  const { data } = await apiClient.patch<AlertResponse>(
    `/api/alerts/${alertId}`,
    update,
  )
  return data
}
