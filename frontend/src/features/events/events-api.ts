import { apiClient } from '../../lib/api-client'
import type {
  EventSubmission,
  FullEventResponse,
  SecurityEvent,
} from './event-types'

export async function getEvents(): Promise<SecurityEvent[]> {
  const { data } = await apiClient.get<SecurityEvent[]>('/api/events')
  return data
}

export async function submitEvent(
  event: EventSubmission,
): Promise<FullEventResponse> {
  const { data } = await apiClient.post<FullEventResponse>('/api/events', event)
  return data
}
