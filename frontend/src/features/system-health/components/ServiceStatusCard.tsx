import type { LucideIcon } from 'lucide-react'

type ServiceState = 'healthy' | 'unhealthy' | 'unreachable' | 'loading'

const styles: Record<
  ServiceState,
  { dot: string; label: string; text: string }
> = {
  healthy: {
    dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.55)]',
    label: 'Healthy',
    text: 'text-emerald-300',
  },
  unhealthy: {
    dot: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,.45)]',
    label: 'Degraded',
    text: 'text-amber-300',
  },
  unreachable: {
    dot: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,.45)]',
    label: 'Unreachable',
    text: 'text-rose-300',
  },
  loading: {
    dot: 'animate-pulse bg-slate-600',
    label: 'Checking',
    text: 'text-slate-400',
  },
}

export function ServiceStatusCard({
  title,
  detail,
  state,
  icon: Icon,
}: {
  title: string
  detail: string
  state: ServiceState
  icon: LucideIcon
}) {
  const style = styles[state]
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className={`mt-3 text-lg font-semibold ${style.text}`}>
            <span
              className={`mr-2 inline-block size-2 rounded-full ${style.dot}`}
              aria-hidden="true"
            />
            {style.label}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-400">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  )
}
