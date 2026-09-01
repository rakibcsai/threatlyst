import { Check, Circle } from 'lucide-react'
import { SeverityBadge } from '../../events/components/SeverityBadge'
import { formatOperationLabel } from '../../operations/operation-utils'

export function NotificationSeverityBadge({ severity }: { severity: string }) {
  return <SeverityBadge severity={severity} />
}

export function NotificationTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-300">
      {formatOperationLabel(type)}
    </span>
  )
}

export function ReadStateBadge({ read }: { read: boolean }) {
  const Icon = read ? Check : Circle
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${read ? 'text-slate-500' : 'text-cyan-300'}`}
    >
      <Icon className={`size-3 ${read ? '' : 'fill-cyan-400'}`} />
      {read ? 'Read' : 'Unread'}
    </span>
  )
}
