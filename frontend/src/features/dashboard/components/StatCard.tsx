import type { LucideIcon } from 'lucide-react'
import { formatCount } from '../dashboard-utils'

const tones = {
  cyan: 'border-cyan-400/20 bg-cyan-400/8 text-cyan-300',
  rose: 'border-rose-400/20 bg-rose-400/8 text-rose-300',
  orange: 'border-orange-400/20 bg-orange-400/8 text-orange-300',
  violet: 'border-violet-400/20 bg-violet-400/8 text-violet-300',
} as const

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  detail: string
  icon: LucideIcon
  tone: keyof typeof tones
}) {
  return (
    <article className="surface-card relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {formatCount(value)}
          </p>
        </div>
        <span
          className={`grid size-10 place-items-center rounded-lg border ${tones[tone]}`}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
