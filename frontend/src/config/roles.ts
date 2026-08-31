import type { UserRole } from '../types/auth'

export function hasRole(role: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(role)
}

export const can = {
  administer: (role: UserRole) => role === 'admin',
  investigate: (role: UserRole) => role === 'admin' || role === 'analyst',
  viewOperations: (_role: UserRole) => true,
}
