import {
  BellRing,
  Blocks,
  Gauge,
  RadioTower,
  Siren,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '../types/auth'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  roles: readonly UserRole[]
}

export const navigation: NavigationItem[] = [
  {
    label: 'SOC Dashboard',
    to: '/dashboard',
    icon: Gauge,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Security Events',
    to: '/events',
    icon: RadioTower,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Alerts',
    to: '/alerts',
    icon: BellRing,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Incidents',
    to: '/incidents',
    icon: Siren,
    roles: ['admin', 'analyst', 'viewer'],
  },
]

export const plannedNavigation = { label: 'Operations modules', icon: Blocks }
