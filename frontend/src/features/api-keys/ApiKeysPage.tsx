import { useMemo, useState } from 'react'
import { KeyRound, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import type { APIKeyCreateResponse, APIKeyResponse } from './api-key-types'
import { ApiKeyCreateDialog } from './components/ApiKeyCreateDialog'
import { ApiKeyRevokeDialog } from './components/ApiKeyRevokeDialog'
import { ApiKeySecretDialog } from './components/ApiKeySecretDialog'
import { ApiKeyTable } from './components/ApiKeyTable'
import { useApiKeys } from './useApiKeys'

export function ApiKeysPage() {
  const query = useApiKeys()
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [created, setCreated] = useState<APIKeyCreateResponse | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<APIKeyResponse | null>(null)
  const [revokedName, setRevokedName] = useState<string | null>(null)
  const data = useMemo(() => query.data ?? [], [query.data])
  const filtered = useMemo(
    () =>
      data.filter(
        (key) =>
          matchesOperationSearch(
            [key.id, key.name, key.key_prefix, key.created_by_user_id],
            search,
          ) &&
          (!state || key.is_active === (state === 'active')),
      ),
    [data, search, state],
  )
  const active = data.filter((key) => key.is_active).length
  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <ShieldCheck className="size-3.5" /> Administrative credentials
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              API Key Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage external ingestion credentials without exposing stored
              secrets.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> Create API key
            </Button>
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
        {query.data && (
          <section
            className="mt-5 grid gap-3 sm:grid-cols-3"
            aria-label="API key inventory summary"
          >
            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Total records
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.length}
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Active keys
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {active}
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Revoked records
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-400">
                {data.length - active}
              </p>
            </div>
          </section>
        )}
        {revokedName && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300"
          >
            API key “{revokedName}” was revoked successfully.
          </div>
        )}
        {query.isLoading ? (
          <QueueSkeleton label="API keys" />
        ) : query.error || !query.data ? (
          <QueueError
            title="API keys unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex justify-between border-b border-slate-800/80 px-4 py-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <KeyRound className="size-4 text-cyan-400" /> Credential
                  inventory
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Metadata only · raw keys are never recoverable
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>
            {query.data.length > 0 && (
              <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Search API keys</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
                  <input
                    aria-label="Search API keys"
                    className="field h-10 pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, prefix, key ID, or creator ID"
                  />
                </label>
                <label>
                  <span className="sr-only">Filter API key state</span>
                  <select
                    aria-label="Filter API key state"
                    className="field h-10 min-w-40"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                  >
                    <option value="">All states</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </label>
              </div>
            )}
            {filtered.length ? (
              <ApiKeyTable keys={filtered} onRevoke={setRevokeTarget} />
            ) : (
              <QueueEmpty filtered={query.data.length > 0} noun="API keys" />
            )}
          </section>
        )}
        <ApiKeyCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={setCreated}
        />
        <ApiKeySecretDialog
          key={created?.api_key ?? 'closed'}
          result={created}
          onClose={() => setCreated(null)}
        />
        <ApiKeyRevokeDialog
          target={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onRevoked={() => {
            setCreated(null)
            setRevokedName(revokeTarget?.name ?? 'API key')
          }}
        />
      </div>
    </main>
  )
}
