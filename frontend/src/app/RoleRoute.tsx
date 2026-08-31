import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasRole } from '../config/roles'
import type { UserRole } from '../types/auth'

export function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: readonly UserRole[]
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!user || !hasRole(user.role, allowedRoles))
    return <Navigate to="/forbidden" replace />
  return children
}
