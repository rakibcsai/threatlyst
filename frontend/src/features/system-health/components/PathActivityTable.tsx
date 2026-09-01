import { formatCount } from '../../dashboard/dashboard-utils'

export function PathActivityTable({
  pathCounts,
}: {
  pathCounts: Record<string, number>
}) {
  const paths = Object.entries(pathCounts).sort(
    ([leftPath, leftCount], [rightPath, rightCount]) =>
      rightCount - leftCount || leftPath.localeCompare(rightPath),
  )

  if (paths.length === 0)
    return (
      <div className="grid h-64 place-items-center text-center text-sm text-slate-500">
        No API path activity has been recorded in this process.
      </div>
    )

  return (
    <div className="max-h-64 overflow-auto">
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 bg-[#0b141f] text-[11px] uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="border-b border-slate-800 px-3 py-2.5 font-bold">
              API path
            </th>
            <th className="border-b border-slate-800 px-3 py-2.5 text-right font-bold">
              Requests
            </th>
          </tr>
        </thead>
        <tbody>
          {paths.map(([path, count], index) => (
            <tr key={path} className="text-slate-300">
              <td className="border-b border-slate-800/70 px-3 py-3">
                <span className="mr-3 font-mono text-xs text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <code className="break-all text-xs text-cyan-200">{path}</code>
              </td>
              <td className="border-b border-slate-800/70 px-3 py-3 text-right font-mono text-xs text-slate-200">
                {formatCount(count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
