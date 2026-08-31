import type { MetricDatum } from '../dashboard-types'
import { formatCount, humanizeMetricLabel } from '../dashboard-utils'

export function RankedMetricList({
  data,
  emptyLabel,
  limit = 6,
  preserveLabels = false,
}: {
  data: MetricDatum[]
  emptyLabel: string
  limit?: number
  preserveLabels?: boolean
}) {
  const visible = data.slice(0, limit)
  const maximum = visible[0]?.value ?? 0

  if (visible.length === 0)
    return (
      <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-600">
        {emptyLabel}
      </div>
    )

  return (
    <ol className="space-y-4">
      {visible.map((item, index) => (
        <li key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0 truncate font-medium text-slate-300">
              <span className="mr-2 text-slate-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              {preserveLabels ? item.name : humanizeMetricLabel(item.name)}
            </span>
            <span className="shrink-0 font-mono text-slate-500">
              {formatCount(item.value)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400"
              style={{
                width: `${maximum === 0 ? 0 : Math.max(5, (item.value / maximum) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
