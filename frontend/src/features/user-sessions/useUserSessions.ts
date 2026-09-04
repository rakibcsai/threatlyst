import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserSessions,
  revokeUserSession,
} from './user-sessions-api'

export const userSessionListKey = ['user-sessions'] as const

export function useUserSessions() {
  return useQuery({
    queryKey: userSessionListKey,
    queryFn: getUserSessions,
  })
}

export function useRevokeUserSession() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: revokeUserSession,
    onSuccess: async () =>
      client.invalidateQueries({
        queryKey: userSessionListKey,
      }),
  })
}