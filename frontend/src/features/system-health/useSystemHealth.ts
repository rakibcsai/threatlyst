import { useQuery } from '@tanstack/react-query'
import {
  getHealth,
  getLiveness,
  getOperationalMetrics,
} from './system-health-api'

export const systemHealthKeys = {
  metrics: ['system-health', 'metrics'] as const,
  readiness: ['system-health', 'readiness'] as const,
  liveness: ['system-health', 'liveness'] as const,
}

export function useOperationalMetrics() {
  return useQuery({
    queryKey: systemHealthKeys.metrics,
    queryFn: getOperationalMetrics,
  })
}

export function useReadiness() {
  return useQuery({
    queryKey: systemHealthKeys.readiness,
    queryFn: getHealth,
  })
}

export function useLiveness() {
  return useQuery({
    queryKey: systemHealthKeys.liveness,
    queryFn: getLiveness,
  })
}
