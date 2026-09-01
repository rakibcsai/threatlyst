import { BellRing, Eye, UserRound } from 'lucide-react'
import type { AlertResponse } from '../alert-types'
import { SeverityBadge } from '../../events/components/SeverityBadge'
import { StatusBadge } from '../../operations/components/StatusBadge'
import {
  activateOperation,
  formatOperationTimestamp,
} from '../../operations/operation-utils'

export function AlertsTable({
  alerts,
  onSelect,
}: {
  alerts: AlertResponse[]
  onSelect: (alert: AlertResponse) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Alert</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Event reference</th>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                role="button"
                tabIndex={0}
                aria-label={`Open alert ${alert.id}`}
                onClick={() => onSelect(alert)}
                onKeyDown={(event) =>
                  activateOperation(event, () => onSelect(alert))
                }
                className="group cursor-pointer border-b border-slate-800/70 align-top transition-colors last:border-0 hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
              >
                <td className="max-w-md px-4 py-4">
                  <p className="text-sm font-semibold text-slate-200">
                    {alert.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {alert.description}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-slate-700">
                    ALT-{alert.id}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-[11px] text-slate-500">
                  <time dateTime={alert.created_at} title={alert.created_at}>
                    {formatOperationTimestamp(alert.created_at)}
                  </time>
                </td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={alert.status} />
                </td>
                <td className="px-4 py-4 font-mono text-xs text-cyan-500">
                  {alert.event_id}
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {alert.assigned_to_user_id === null
                    ? 'Unassigned'
                    : `User ${alert.assigned_to_user_id}`}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-cyan-400 group-hover:bg-cyan-400/10">
                    <Eye className="size-3.5" /> View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 lg:hidden">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            role="button"
            tabIndex={0}
            aria-label={`Open alert ${alert.id}`}
            onClick={() => onSelect(alert)}
            onKeyDown={(event) =>
              activateOperation(event, () => onSelect(alert))
            }
            className="group cursor-pointer p-4 transition-colors hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <BellRing className="size-4 text-cyan-500" /> {alert.title}
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-600">
                  ALT-{alert.id} · Event {alert.event_id}
                </p>
                <time
                  className="mt-1.5 block text-[10px] text-slate-600"
                  dateTime={alert.created_at}
                  title={alert.created_at}
                >
                  Created {formatOperationTimestamp(alert.created_at)}
                </time>
              </div>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {alert.description}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/70 pt-3">
              <StatusBadge status={alert.status} />
              <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <UserRound className="size-3.5" />
                {alert.assigned_to_user_id === null
                  ? 'Unassigned'
                  : `User ${alert.assigned_to_user_id}`}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
