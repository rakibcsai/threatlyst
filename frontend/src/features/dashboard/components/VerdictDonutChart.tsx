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
      className="grid min-h-64 grid-cols-[minmax(0,1fr)_8rem] items-center gap-4"
      role="img"
      aria-label={`AI verdicts: ${verdicts.suspicious} suspicious and ${verdicts.benign} benign`}
    >
      <div className="relative h-52 min-w-0">
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
          <span className="text-2xl font-semibold text-white">
            {suspiciousRate}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Suspicious
          </span>
        </div>
      </div>
      <ul className="space-y-4">
        {data.map((item) => (
          <li key={item.name}>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </div>
            <p className="mt-1 pl-4 text-lg font-semibold text-slate-100">
              {formatCount(item.value)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
