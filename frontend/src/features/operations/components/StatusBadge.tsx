import { cn } from '../../../lib/cn'
import { formatOperationLabel } from '../operation-utils'

const statusStyles: Record<string, string> = {
  open: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  investigating: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
  contained: 'border-blue-400/25 bg-blue-400/10 text-blue-300',
  resolved: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  closed: 'border-slate-600 bg-slate-800 text-slate-400',
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]',
        statusStyles[normalized] ??
          'border-slate-600 bg-slate-800 text-slate-300',
      )}
    >
      {formatOperationLabel(status)}
    </span>
  )
}
