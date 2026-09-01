import { useMemo, useState } from 'react'
import { BellRing, Eye, Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { can } from '../../config/roles'
import { useAuth } from '../../hooks/useAuth'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { QueueToolbar } from '../operations/components/QueueToolbar'
import { matchesOperationSearch } from '../operations/operation-utils'
import { alertStatuses, type AlertResponse } from './alert-types'
import { AlertCreateDialog } from './components/AlertCreateDialog'
import { AlertDetails } from './components/AlertDetails'
import { AlertsTable } from './components/AlertsTable'
import { useAlerts } from './useAlerts'

export function AlertsPage() {
  const { user } = useAuth()
  const query = useAlerts()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<AlertResponse | null>(null)
  const canEdit = Boolean(user && can.investigate(user.role))
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (alert) =>
          matchesOperationSearch(
            [
              alert.id,
              alert.event_id,
              alert.title,
              alert.description,
              alert.assigned_to_user_id,
            ],
            search,
          ) &&
          (!severity || alert.severity.toLowerCase() === severity) &&
          (!status || alert.status === status),
      ),
    [query.data, search, severity, status],
  )

  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <BellRing className="size-3.5" /> Detection operations
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white md:text-3xl">
              Alerts
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Triage and manage alert records generated from security events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> Create alert
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-500">
                <Eye className="size-4" /> Read-only access
              </span>
            )}
            <Button
              variant="secondary"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw
                className={`size-4 ${query.isFetching ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        {query.isLoading ? (
          <QueueSkeleton label="alerts" />
        ) : query.error || !query.data ? (
          <QueueError
            title="Alerts unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-800/80 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Alert queue
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Client-side view of all records returned by GET /api/alerts
                </p>
              </div>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-300">
                  {filtered.length}
                </span>{' '}
                of {query.data.length} alerts
              </p>
            </div>
            {query.data.length > 0 && (
              <QueueToolbar
                noun="alerts"
                search={search}
                severity={severity}
                status={status}
                statuses={alertStatuses}
                onSearchChange={setSearch}
                onSeverityChange={setSeverity}
                onStatusChange={setStatus}
                onClear={() => {
                  setSearch('')
                  setSeverity('')
                  setStatus('')
                }}
              />
            )}
            {filtered.length > 0 ? (
              <AlertsTable alerts={filtered} onSelect={setSelected} />
            ) : (
              <QueueEmpty filtered={query.data.length > 0} noun="alerts" />
            )}
          </section>
        )}
        <AlertCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
        <AlertDetails
          alertId={selected?.id ?? null}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
        />
      </div>
    </main>
  )
}
