import { useQuery } from '@tanstack/react-query'
import { getSecurityReport } from './reports-api'

export const securityReportKey = ['reports', 'security-summary'] as const

export function useSecurityReport() {
  return useQuery({ queryKey: securityReportKey, queryFn: getSecurityReport })
}
