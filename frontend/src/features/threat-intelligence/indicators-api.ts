import { apiClient } from '../../lib/api-client'
import type {
  ThreatIndicatorCreate,
  ThreatIndicatorResponse,
  ThreatIndicatorUpdate,
} from './indicator-types'

const basePath = '/api/threat-intelligence/indicators'
export async function getIndicators() {
  const { data } = await apiClient.get<ThreatIndicatorResponse[]>(basePath)
  return data
}
export async function getIndicator(id: number) {
  const { data } = await apiClient.get<ThreatIndicatorResponse>(
    `${basePath}/${id}`,
  )
  return data
}
export async function createIndicator(value: ThreatIndicatorCreate) {
  const { data } = await apiClient.post<ThreatIndicatorResponse>(
    basePath,
    value,
  )
  return data
}
export async function updateIndicator({
  id,
  update,
}: {
  id: number
  update: ThreatIndicatorUpdate
}) {
  const { data } = await apiClient.patch<ThreatIndicatorResponse>(
    `${basePath}/${id}`,
    update,
  )
  return data
}
