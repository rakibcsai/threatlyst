import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createIndicator,
  getIndicator,
  getIndicators,
  updateIndicator,
} from './indicators-api'

export const indicatorKeys = {
  all: ['threat-indicators'] as const,
  detail: (id: number) => ['threat-indicators', id] as const,
}
export function useIndicators() {
  return useQuery({ queryKey: indicatorKeys.all, queryFn: getIndicators })
}
export function useIndicator(id: number | null) {
  return useQuery({
    queryKey: indicatorKeys.detail(id ?? 0),
    queryFn: () => getIndicator(id as number),
    enabled: id !== null,
  })
}
export function useCreateIndicator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createIndicator,
    onSuccess: async (item) => {
      client.setQueryData(indicatorKeys.detail(item.id), item)
      await client.invalidateQueries({ queryKey: indicatorKeys.all })
    },
  })
}
export function useUpdateIndicator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateIndicator,
    onSuccess: async (item) => {
      client.setQueryData(indicatorKeys.detail(item.id), item)
      await Promise.all([
        client.invalidateQueries({ queryKey: indicatorKeys.all }),
        client.invalidateQueries({ queryKey: indicatorKeys.detail(item.id) }),
      ])
    },
  })
}
