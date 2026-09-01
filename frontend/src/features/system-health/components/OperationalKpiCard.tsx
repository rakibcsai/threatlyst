import type { LucideIcon } from 'lucide-react'

export function OperationalKpiCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {value}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/8 text-cyan-300">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
