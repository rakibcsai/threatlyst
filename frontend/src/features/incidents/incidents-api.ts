import { apiClient } from '../../lib/api-client'
import type {
  IncidentCreate,
  IncidentResponse,
  IncidentUpdate,
} from './incident-types'

export async function getIncidents() {
  const { data } = await apiClient.get<IncidentResponse[]>('/api/incidents')
  return data
}

export async function getIncident(incidentId: number) {
  const { data } = await apiClient.get<IncidentResponse>(
    `/api/incidents/${incidentId}`,
  )
  return data
}

export async function createIncident(incident: IncidentCreate) {
  const { data } = await apiClient.post<IncidentResponse>(
    '/api/incidents',
    incident,
  )
  return data
}

export async function updateIncident({
  incidentId,
  update,
}: {
  incidentId: number
  update: IncidentUpdate
}) {
  const { data } = await apiClient.patch<IncidentResponse>(
    `/api/incidents/${incidentId}`,
    update,
  )
  return data
}
