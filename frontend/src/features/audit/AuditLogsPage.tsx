import { useMemo, useState } from 'react'
import { RefreshCw, ScrollText } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import type { AuditLogResponse } from './audit-types'
import { AuditDetails } from './components/AuditDetails'
import { AuditTable } from './components/AuditTable'
import { AuditToolbar } from './components/AuditToolbar'
import { useAuditLogs } from './useAuditLogs'

export function AuditLogsPage() {
  const query = useAuditLogs()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const [selected, setSelected] = useState<AuditLogResponse | null>(null)
  const data = useMemo(() => query.data ?? [], [query.data])
  const statuses = useMemo(
    () => [...new Set(data.map((log) => log.status))].sort(),
    [data],
  )
  const actions = useMemo(
    () => [...new Set(data.map((log) => log.action))].sort(),
    [data],
  )
  const resources = useMemo(
    () => [...new Set(data.map((log) => log.resource_type))].sort(),
    [data],
  )
  const filtered = useMemo(
    () =>
      data.filter(
        (log) =>
          matchesOperationSearch(
            [
              log.id,
              log.user_id,
              log.username,
              log.action,
              log.resource_type,
              log.resource_id,
              log.status,
              log.details,
              log.ip_address,
            ],
            search,
          ) &&
          (!status || log.status === status) &&
          (!action || log.action === action) &&
          (!resource || log.resource_type === resource),
      ),
    [data, search, status, action, resource],
  )
  const change = (
    field: 'search' | 'status' | 'action' | 'resource',
    value: string,
  ) =>
    ({
      search: setSearch,
      status: setStatus,
      action: setAction,
      resource: setResource,
    })[field](value)
  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <ScrollText className="size-3.5" /> Administrative oversight
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Audit Logs
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Immutable user-action history returned by ThreatLyst.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw
              className={`size-4 ${query.isFetching ? 'animate-spin' : ''}`}
            />{' '}
            Refresh
          </Button>
        </div>
        {query.isLoading ? (
          <QueueSkeleton label="audit logs" />
        ) : query.error || !query.data ? (
          <QueueError
            title="Audit logs unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex justify-between border-b border-slate-800/80 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Administrative audit trail
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Latest 100 records · read-only · filters are client-side
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>
            {query.data.length > 0 && (
              <AuditToolbar
                search={search}
                status={status}
                action={action}
                resource={resource}
                statuses={statuses}
                actions={actions}
                resources={resources}
                onChange={change}
                onClear={() => {
                  setSearch('')
                  setStatus('')
                  setAction('')
                  setResource('')
                }}
              />
            )}
            {filtered.length ? (
              <AuditTable logs={filtered} onSelect={setSelected} />
            ) : (
              <QueueEmpty filtered={query.data.length > 0} noun="audit logs" />
            )}
          </section>
        )}
        <AuditDetails
          id={selected?.id ?? null}
          onClose={() => setSelected(null)}
        />
      </div>
    </main>
  )
}
