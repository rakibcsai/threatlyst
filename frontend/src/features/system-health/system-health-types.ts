export interface OperationalMetrics {
  total_requests: number
  total_errors: number
  average_duration_ms: number
  status_counts: Record<string, number>
  path_counts: Record<string, number>
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  service: string
  database: 'healthy' | 'unhealthy'
}

export interface LivenessResponse {
  status: 'alive'
  service: string
}
