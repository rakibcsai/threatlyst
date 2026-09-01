import { Eye, ScrollText, UserRound } from 'lucide-react'
import {
  activateOperation,
  formatOperationTimestamp,
} from '../../operations/operation-utils'
import type { AuditLogResponse } from '../audit-types'
import {
  AuditActionBadge,
  AuditStatusBadge,
  ResourceBadge,
} from './AuditBadges'

export function AuditTable({
  logs,
  onSelect,
}: {
  logs: AuditLogResponse[]
  onSelect: (log: AuditLogResponse) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1120px] text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source IP</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                role="button"
                tabIndex={0}
                aria-label={`Open audit log ${log.id}`}
                onClick={() => onSelect(log)}
                onKeyDown={(event) =>
                  activateOperation(event, () => onSelect(log))
                }
                className="group cursor-pointer border-b border-slate-800/70 hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
              >
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                  {formatOperationTimestamp(log.created_at)}
                  <p className="mt-1 font-mono text-[10px] text-slate-700">
                    LOG-{log.id}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs font-semibold text-slate-300">
                    {log.username ?? 'System'}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-600">
                    {log.user_id === null
                      ? 'No user ID'
                      : `User ${log.user_id}`}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <AuditActionBadge action={log.action} />
                </td>
                <td className="px-4 py-4">
                  <ResourceBadge resource={log.resource_type} />
                  {log.resource_id && (
                    <p className="mt-1.5 font-mono text-[10px] text-slate-600">
                      {log.resource_id}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <AuditStatusBadge status={log.status} />
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-500">
                  {log.ip_address ?? 'Not recorded'}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-cyan-400 group-hover:bg-cyan-400/10">
                    <Eye className="size-3.5" /> View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 lg:hidden">
        {logs.map((log) => (
          <article
            key={log.id}
            role="button"
            tabIndex={0}
            aria-label={`Open audit log ${log.id}`}
            onClick={() => onSelect(log)}
            onKeyDown={(event) => activateOperation(event, () => onSelect(log))}
            className="cursor-pointer p-4 hover:bg-slate-800/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <ScrollText className="size-4 shrink-0 text-cyan-400" />
                <AuditActionBadge action={log.action} />
              </div>
              <AuditStatusBadge status={log.status} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <UserRound className="size-3.5 text-slate-600" />
              {log.username ?? 'System'}
              {log.user_id !== null && (
                <span className="font-mono text-slate-600">
                  · {log.user_id}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ResourceBadge resource={log.resource_type} />
              <span className="font-mono text-[11px] text-slate-600">
                {log.resource_id ?? 'No resource ID'}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-600">
              {formatOperationTimestamp(log.created_at)} ·{' '}
              {log.ip_address ?? 'IP not recorded'}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
