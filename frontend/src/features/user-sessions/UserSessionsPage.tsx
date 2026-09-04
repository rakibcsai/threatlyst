import { useMemo, useState } from 'react'
import {
  Clock3,
  Laptop,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCog,
  Wifi,
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { FeedbackMessage } from '../../components/ui/FeedbackMessage'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import type { UserSession } from './user-sessions-api'
import { useRevokeUserSession, useUserSessions } from './useUserSessions'

function formatDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function getStatusClasses(status: UserSession['status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    case 'idle':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    case 'revoked':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    case 'logged_out':
      return 'border-slate-600 bg-slate-800/70 text-slate-300'
    case 'expired':
      return 'border-violet-500/30 bg-violet-500/10 text-violet-300'
    default:
      return 'border-slate-700 bg-slate-900 text-slate-300'
  }
}

function formatStatus(status: UserSession['status']) {
  return status.replace('_', ' ')
}

export function UserSessionsPage() {
  const query = useUserSessions()
  const revokeMutation = useRevokeUserSession()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [revokedSessionId, setRevokedSessionId] = useState<string | null>(null)

  const data = useMemo(() => query.data ?? [], [query.data])

  const filtered = useMemo(
    () =>
      data.filter(
        (session) =>
          matchesOperationSearch(
            [
              session.session_id,
              session.user_id,
              session.username,
              session.email,
              session.role,
              session.ip_address,
              session.location,
              session.browser,
              session.operating_system,
              session.device_type,
              session.status,
            ],
            search,
          ) &&
          (!status || session.status === status),
      ),
    [data, search, status],
  )

  const activeCount = data.filter(
    (session) => session.status === 'active',
  ).length

  const idleCount = data.filter((session) => session.status === 'idle').length

  const endedCount = data.filter((session) =>
    ['revoked', 'logged_out', 'expired'].includes(session.status),
  ).length

  async function handleRevoke(session: UserSession) {
    const confirmed = window.confirm(
      `Revoke session ${session.session_id.slice(0, 8)} for ${session.username}?`,
    )

    if (!confirmed) {
      return
    }

    setRevokedSessionId(null)

    try {
      await revokeMutation.mutateAsync(session.session_id)
      setRevokedSessionId(session.session_id)
    } catch {
      // Mutation error is rendered below.
    }
  }

  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <ShieldCheck className="size-3.5" />
              Administrative monitoring
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              User Sessions
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Monitor authenticated ThreatLyst sessions, distinguish multiple
              concurrent logins, and revoke individual sessions without
              affecting other users or devices.
            </p>
          </div>

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

        {query.data && (
          <section
            className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="User session summary"
          >
            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Total sessions
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.length}
              </p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Active now
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {activeCount}
              </p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Idle sessions
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">
                {idleCount}
              </p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Ended sessions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-400">
                {endedCount}
              </p>
            </div>
          </section>
        )}

        {revokedSessionId && (
          <FeedbackMessage tone="success" className="mt-4">
            Session {revokedSessionId.slice(0, 8)} was revoked successfully.
          </FeedbackMessage>
        )}

        {revokeMutation.error && (
          <FeedbackMessage tone="error" className="mt-4">
            The session could not be revoked. Please try again.
          </FeedbackMessage>
        )}

        {query.isLoading ? (
          <QueueSkeleton label="user sessions" />
        ) : query.error || !query.data ? (
          <QueueError
            title="User sessions unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-800/80 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <UserRoundCog className="size-4 text-cyan-400" />
                  Authenticated session inventory
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Each successful login creates a separate ThreatLyst session.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>

            {query.data.length > 0 && (
              <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Search user sessions</span>

                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />

                  <input
                    aria-label="Search user sessions"
                    className="field h-10 pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search user, email, IP, browser, device, location, or session ID"
                  />
                </label>

                <label>
                  <span className="sr-only">Filter session status</span>

                  <select
                    aria-label="Filter session status"
                    className="field h-10 min-w-44"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="">All states</option>
                    <option value="active">Active</option>
                    <option value="idle">Idle</option>
                    <option value="logged_out">Logged out</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </label>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-bold">User</th>
                      <th className="px-4 py-3 font-bold">Session</th>
                      <th className="px-4 py-3 font-bold">Device</th>
                      <th className="px-4 py-3 font-bold">Network</th>
                      <th className="px-4 py-3 font-bold">Login activity</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {filtered.map((session) => {
                      const canRevoke =
                        !session.revoked &&
                        !['logged_out', 'expired', 'revoked'].includes(
                          session.status,
                        )

                      const isRevoking =
                        revokeMutation.isPending &&
                        revokeMutation.variables === session.session_id

                      return (
                        <tr
                          key={session.session_id}
                          className="align-top transition hover:bg-slate-900/40"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-200">
                              {session.username}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {session.email}
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-500/80">
                              {session.role}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-mono text-xs text-slate-300">
                              {session.session_id.slice(0, 12)}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-600">
                              User ID {session.user_id}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="flex items-center gap-2 text-xs text-slate-300">
                              <Laptop className="size-3.5 text-slate-500" />
                              {session.browser ?? 'Unknown browser'}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {session.operating_system ?? 'Unknown OS'}
                              {' · '}
                              {session.device_type ?? 'Unknown device'}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="flex items-center gap-2 text-xs text-slate-300">
                              <Wifi className="size-3.5 text-slate-500" />
                              {session.ip_address ?? 'Unknown IP'}
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="size-3.5" />
                              {session.location ?? 'Location unavailable'}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="flex items-center gap-2 text-xs text-slate-300">
                              <Clock3 className="size-3.5 text-slate-500" />
                              Login: {formatDateTime(session.login_at)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Last seen: {formatDateTime(session.last_seen_at)}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Expires: {formatDateTime(session.expires_at)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusClasses(
                                session.status,
                              )}`}
                            >
                              {formatStatus(session.status)}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="secondary"
                              disabled={!canRevoke || isRevoking}
                              onClick={() => void handleRevoke(session)}
                            >
                              {isRevoking
                                ? 'Revoking...'
                                : canRevoke
                                  ? 'Revoke'
                                  : 'Unavailable'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <QueueEmpty
                filtered={query.data.length > 0}
                noun="user sessions"
              />
            )}
          </section>
        )}
      </div>
    </main>
  )
}
