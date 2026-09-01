import { apiClient } from '../../lib/api-client'
import type {
  MITRETechniqueCreate,
  MITRETechniqueResponse,
  MITRETechniqueUpdate,
} from './mitre-types'
const basePath = '/api/mitre/techniques'
export async function getTechniques() {
  const { data } = await apiClient.get<MITRETechniqueResponse[]>(basePath)
  return data
}
export async function getTechnique(id: number) {
  const { data } = await apiClient.get<MITRETechniqueResponse>(
    `${basePath}/${id}`,
  )
  return data
}
export async function createTechnique(value: MITRETechniqueCreate) {
  const { data } = await apiClient.post<MITRETechniqueResponse>(basePath, value)
  return data
}
export async function updateTechnique({
  id,
  update,
}: {
  id: number
  update: MITRETechniqueUpdate
}) {
  const { data } = await apiClient.patch<MITRETechniqueResponse>(
    `${basePath}/${id}`,
    update,
  )
  return data
}
