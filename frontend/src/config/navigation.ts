import { Blocks, LayoutGrid, type LucideIcon } from 'lucide-react'
import type { UserRole } from '../types/auth'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  roles: readonly UserRole[]
}

export const navigation: NavigationItem[] = [
  { label: 'Workspace', to: '/workspace', icon: LayoutGrid, roles: ['admin', 'analyst', 'viewer'] },
]

export const plannedNavigation = { label: 'Operations modules', icon: Blocks }
