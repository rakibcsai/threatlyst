import axios from 'axios'
import type { ApiErrorBody } from '../types/api'

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error))
    return 'An unexpected error occurred.'

  const detail = error.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(' ')
  if (!error.response) return 'Unable to reach the ThreatLyst API.'
  return 'The request could not be completed.'
}
