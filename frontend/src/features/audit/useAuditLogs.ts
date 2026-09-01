import { useQuery } from '@tanstack/react-query'
import { getAuditLog, getAuditLogs } from './audit-api'

export const auditKeys = {
  all: ['audit-logs'] as const,
  detail: (id: number) => ['audit-logs', id] as const,
}

export function useAuditLogs() {
  return useQuery({ queryKey: auditKeys.all, queryFn: () => getAuditLogs(100) })
}

export function useAuditLog(id: number | null) {
  return useQuery({
    queryKey: auditKeys.detail(id ?? 0),
    queryFn: () => getAuditLog(id as number),
    enabled: id !== null,
  })
}
