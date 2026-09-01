import { cn } from '../../../lib/cn'

const severityStyles: Record<string, string> = {
  critical: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
  high: 'border-orange-400/25 bg-orange-400/10 text-orange-300',
  medium: 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300',
  low: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
}

export function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
        severityStyles[normalized] ??
          'border-slate-600 bg-slate-800 text-slate-300',
      )}
    >
      {severity}
    </span>
  )
}
