import axios from 'axios'
import { apiClient } from '../../lib/api-client'
import type {
  HealthResponse,
  LivenessResponse,
  OperationalMetrics,
} from './system-health-types'

export async function getOperationalMetrics() {
  const { data } = await apiClient.get<OperationalMetrics>('/api/metrics')
  return data
}

export async function getHealth() {
  try {
    const { data } = await apiClient.get<HealthResponse>('/health')
    return data
  } catch (error) {
    if (
      axios.isAxiosError<HealthResponse>(error) &&
      error.response?.status === 503
    )
      return error.response.data
    throw error
  }
}

export async function getLiveness() {
  const { data } = await apiClient.get<LivenessResponse>('/live')
  return data
}
