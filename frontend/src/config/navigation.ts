import {
  BellRing,
  Blocks,
  ClipboardList,
  FileChartColumn,
  Gauge,
  Radar,
  RadioTower,
  Siren,
  Shield,
  MailWarning,
  KeyRound,
  HeartPulse,
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
  {
    label: 'Threat Intelligence',
    to: '/threat-intelligence',
    icon: Radar,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'MITRE ATT&CK',
    to: '/mitre',
    icon: Shield,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Notifications',
    to: '/notifications',
    icon: MailWarning,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Security Reports',
    to: '/reports',
    icon: FileChartColumn,
    roles: ['admin', 'analyst'],
  },
  {
    label: 'System Health',
    to: '/system-health',
    icon: HeartPulse,
    roles: ['admin', 'analyst', 'viewer'],
  },
  {
    label: 'Audit Logs',
    to: '/audit',
    icon: ClipboardList,
    roles: ['admin'],
  },
  {
    label: 'API Keys',
    to: '/api-keys',
    icon: KeyRound,
    roles: ['admin'],
  },
]

export const plannedNavigation = { label: 'Operations modules', icon: Blocks }
