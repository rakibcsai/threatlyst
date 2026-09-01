import { CheckCircle2, CircleAlert } from 'lucide-react'
import { formatOperationLabel } from '../../operations/operation-utils'

export function AuditStatusBadge({ status }: { status: string }) {
  const successful = status.toLowerCase() === 'success'
  const Icon = successful ? CheckCircle2 : CircleAlert
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${successful ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300' : 'border-rose-400/20 bg-rose-400/[0.08] text-rose-300'}`}
    >
      <Icon className="size-3" /> {formatOperationLabel(status)}
    </span>
  )
}

export function AuditActionBadge({ action }: { action: string }) {
  return (
    <span className="inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-1 font-mono text-[10px] font-semibold text-cyan-300">
      {action}
    </span>
  )
}

export function ResourceBadge({ resource }: { resource: string }) {
  return (
    <span className="inline-flex rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">
      {formatOperationLabel(resource)}
    </span>
  )
}
