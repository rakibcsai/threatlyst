import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApiKey, getApiKeys, revokeApiKey } from './api-keys-api'

export const apiKeyListKey = ['api-keys'] as const

export function useApiKeys() {
  return useQuery({ queryKey: apiKeyListKey, queryFn: getApiKeys })
}

export function useCreateApiKey() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createApiKey,
    onSuccess: async () =>
      client.invalidateQueries({ queryKey: apiKeyListKey }),
  })
}

export function useRevokeApiKey() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: revokeApiKey,
    onSuccess: async () =>
      client.invalidateQueries({ queryKey: apiKeyListKey }),
  })
}
