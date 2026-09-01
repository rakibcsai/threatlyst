import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTechnique,
  getTechnique,
  getTechniques,
  updateTechnique,
} from './mitre-api'
export const mitreKeys = {
  all: ['mitre-techniques'] as const,
  detail: (id: number) => ['mitre-techniques', id] as const,
}
export function useTechniques() {
  return useQuery({ queryKey: mitreKeys.all, queryFn: getTechniques })
}
export function useTechnique(id: number | null) {
  return useQuery({
    queryKey: mitreKeys.detail(id ?? 0),
    queryFn: () => getTechnique(id as number),
    enabled: id !== null,
  })
}
export function useCreateTechnique() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createTechnique,
    onSuccess: async (item) => {
      client.setQueryData(mitreKeys.detail(item.id), item)
      await client.invalidateQueries({ queryKey: mitreKeys.all })
    },
  })
}
export function useUpdateTechnique() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateTechnique,
    onSuccess: async (item) => {
      client.setQueryData(mitreKeys.detail(item.id), item)
      await Promise.all([
        client.invalidateQueries({ queryKey: mitreKeys.all }),
        client.invalidateQueries({ queryKey: mitreKeys.detail(item.id) }),
      ])
    },
  })
}
