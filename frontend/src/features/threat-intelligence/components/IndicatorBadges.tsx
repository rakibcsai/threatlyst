import { AtSign, FileKey2, Globe2, Link2, Network } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { formatOperationLabel } from '../../operations/operation-utils'
import type { IndicatorType } from '../indicator-types'

const icons = {
  ip: Network,
  domain: Globe2,
  url: Link2,
  file_hash: FileKey2,
  email: AtSign,
}
export function IndicatorTypeBadge({ type }: { type: IndicatorType }) {
  const Icon = icons[type]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-300">
      <Icon className="size-3" />
      {formatOperationLabel(type)}
    </span>
  )
}
export function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-[10px] font-bold tabular-nums',
        value >= 80
          ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
          : value >= 50
            ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
            : 'border-slate-600 bg-slate-800 text-slate-300',
      )}
    >
      {value}% confidence
    </span>
  )
}
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]',
        active
          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
          : 'border-slate-600 bg-slate-800 text-slate-400',
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
