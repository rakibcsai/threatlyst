import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { VerdictStats } from '../dashboard-types'
import { formatCount } from '../dashboard-utils'

export function VerdictDonutChart({ verdicts }: { verdicts: VerdictStats }) {
  const data = [
    { name: 'Suspicious', value: verdicts.suspicious, color: '#fb7185' },
    { name: 'Benign', value: verdicts.benign, color: '#22d3ee' },
  ]
  const total = verdicts.suspicious + verdicts.benign
  const suspiciousRate =
    total === 0 ? 0 : Math.round((verdicts.suspicious / total) * 100)

  return (
    <div
      className="grid min-h-64 min-w-0 grid-cols-1 items-center gap-2 overflow-hidden sm:grid-cols-[minmax(0,1fr)_8rem] sm:gap-4"
      role="img"
      aria-label={`AI verdicts: ${verdicts.suspicious} suspicious and ${verdicts.benign} benign`}
      data-testid="verdict-chart-layout"
    >
      <div className="relative h-52 min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="84%"
              paddingAngle={total > 0 ? 3 : 0}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0b1620',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [formatCount(Number(value)), 'Events']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span
            className="text-2xl font-semibold leading-none text-white"
            data-testid="verdict-rate"
          >
            {suspiciousRate}%
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            Suspicious
          </span>
        </div>
      </div>
      <ul
        className="grid min-w-0 grid-cols-2 gap-2 border-t border-slate-800/70 pt-3 sm:block sm:space-y-4 sm:border-0 sm:pt-0"
        data-testid="verdict-legend"
      >
        {data.map((item) => (
          <li key={item.name} className="min-w-0 px-1 sm:px-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </div>
            <p className="mt-1 truncate pl-4 text-base font-semibold text-slate-100 sm:text-lg">
              {formatCount(item.value)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
