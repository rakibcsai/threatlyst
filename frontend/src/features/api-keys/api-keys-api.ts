import { apiClient } from '../../lib/api-client'
import type {
  APIKeyCreate,
  APIKeyCreateResponse,
  APIKeyResponse,
} from './api-key-types'

const basePath = '/api/api-keys'

export async function getApiKeys() {
  const { data } = await apiClient.get<APIKeyResponse[]>(basePath)
  return data
}

export async function createApiKey(value: APIKeyCreate) {
  const { data } = await apiClient.post<APIKeyCreateResponse>(basePath, value)
  return data
}

export async function revokeApiKey(id: number) {
  const { data } = await apiClient.delete<APIKeyResponse>(`${basePath}/${id}`)
  return data
}
