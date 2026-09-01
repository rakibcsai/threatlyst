import { useMemo, useState } from 'react'
import { BellRing, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { getApiErrorMessage } from '../../lib/api-error'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import { NotificationDetails } from './components/NotificationDetails'
import { NotificationsList } from './components/NotificationsList'
import { NotificationToolbar } from './components/NotificationToolbar'
import type { NotificationResponse } from './notification-types'
import { useMarkNotificationRead, useNotifications } from './useNotifications'

export function NotificationsPage() {
  const query = useNotifications()
  const mutation = useMarkNotificationRead()
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [selected, setSelected] = useState<NotificationResponse | null>(null)
  const data = useMemo(() => query.data ?? [], [query.data])
  const types = useMemo(
    () => [...new Set(data.map((item) => item.notification_type))].sort(),
    [data],
  )
  const severities = useMemo(
    () => [...new Set(data.map((item) => item.severity))].sort(),
    [data],
  )
  const filtered = useMemo(
    () =>
      data.filter(
        (item) =>
          matchesOperationSearch(
            [
              item.id,
              item.title,
              item.message,
              item.notification_type,
              item.resource_type,
              item.resource_id,
            ],
            search,
          ) &&
          (!state || item.is_read === (state === 'read')) &&
          (!type || item.notification_type === type) &&
          (!severity || item.severity === severity),
      ),
    [data, search, state, type, severity],
  )
  const unread = data.filter((item) => !item.is_read).length
  const change = (
    field: 'search' | 'state' | 'type' | 'severity',
    value: string,
  ) =>
    ({
      search: setSearch,
      state: setState,
      type: setType,
      severity: setSeverity,
    })[field](value)
  const markRead = async (id: number) => {
    try {
      await mutation.mutateAsync(id)
    } catch {
      /* rendered below */
    }
  }
  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <BellRing className="size-3.5" /> Analyst communications
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              User-targeted and global operational notices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {query.data && (
              <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-2 text-xs font-semibold text-cyan-300">
                {unread} unread
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
          <QueueSkeleton label="notifications" />
        ) : query.error || !query.data ? (
          <QueueError
            title="Notifications unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex justify-between border-b border-slate-800/80 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Notification center
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Latest 100 notifications · filters are client-side
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>
            {query.data.length > 0 && (
              <NotificationToolbar
                search={search}
                state={state}
                type={type}
                types={types}
                severity={severity}
                severities={severities}
                onChange={change}
                onClear={() => {
                  setSearch('')
                  setState('')
                  setType('')
                  setSeverity('')
                }}
              />
            )}
            {mutation.error && (
              <p
                role="alert"
                className="border-b border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300"
              >
                {getApiErrorMessage(mutation.error)}
              </p>
            )}
            {filtered.length ? (
              <NotificationsList
                notifications={filtered}
                markingId={mutation.isPending ? mutation.variables : null}
                onSelect={setSelected}
                onMarkRead={(id) => void markRead(id)}
              />
            ) : (
              <QueueEmpty
                filtered={query.data.length > 0}
                noun="notifications"
              />
            )}
          </section>
        )}
        <NotificationDetails
          id={selected?.id ?? null}
          onClose={() => setSelected(null)}
        />
      </div>
    </main>
  )
}
