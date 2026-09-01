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
import { formatCount } from '../../dashboard/dashboard-utils'

function statusColor(status: string) {
  const code = Number(status)
  if (code >= 500) return '#fb7185'
  if (code >= 400) return '#fb923c'
  if (code >= 300) return '#facc15'
  if (code >= 200) return '#34d399'
  return '#38bdf8'
}

export function StatusDistributionChart({
  statusCounts,
}: {
  statusCounts: Record<string, number>
}) {
  const data = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => Number(left.status) - Number(right.status))

  if (data.length === 0)
    return (
      <div className="grid h-64 place-items-center text-center text-sm text-slate-500">
        No HTTP status counts have been recorded in this process.
      </div>
    )

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label={`HTTP status distribution: ${data.map(({ status, count }) => `${status} ${count}`).join(', ')}`}
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
            dataKey="status"
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
            formatter={(value) => [formatCount(Number(value)), 'Requests']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44}>
            {data.map((item) => (
              <Cell key={item.status} fill={statusColor(item.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
