import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RiskLevelStats } from '../dashboard-types'
import { formatCount } from '../dashboard-utils'

const colors = ['#fb7185', '#fb923c', '#facc15', '#34d399']

export function RiskDistributionChart({
  riskLevels,
}: {
  riskLevels: RiskLevelStats
}) {
  const data = [
    { name: 'Critical', value: riskLevels.critical },
    { name: 'High', value: riskLevels.high },
    { name: 'Medium', value: riskLevels.medium },
    { name: 'Low', value: riskLevels.low },
  ]

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label={`Risk distribution: ${data.map((item) => `${item.name} ${item.value}`).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#1e293b"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(30, 41, 59, .35)' }}
            contentStyle={{
              background: '#0b1620',
              border: '1px solid #334155',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [formatCount(Number(value)), 'Events']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={44}>
            {data.map((item, index) => (
              <Cell key={item.name} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
