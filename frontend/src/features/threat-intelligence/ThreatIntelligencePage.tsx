import { useMemo, useState } from 'react'
import { Eye, Plus, Radar, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { can } from '../../config/roles'
import { useAuth } from '../../hooks/useAuth'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import { IndicatorCreateDialog } from './components/IndicatorCreateDialog'
import { IndicatorDetails } from './components/IndicatorDetails'
import { IndicatorsTable } from './components/IndicatorsTable'
import { IndicatorToolbar } from './components/IndicatorToolbar'
import type { ThreatIndicatorResponse } from './indicator-types'
import { useIndicators } from './useIndicators'

export function ThreatIntelligencePage() {
  const { user } = useAuth()
  const query = useIndicators()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [active, setActive] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<ThreatIndicatorResponse | null>(null)
  const canEdit = Boolean(user && can.investigate(user.role))
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (item) =>
          matchesOperationSearch(
            [
              item.id,
              item.indicator_value,
              item.threat_type,
              item.source,
              item.description,
            ],
            search,
          ) &&
          (!type || item.indicator_type === type) &&
          (!severity || item.severity === severity) &&
          (!active || item.is_active === (active === 'active')),
      ),
    [query.data, search, type, severity, active],
  )
  const change = (
    field: 'search' | 'type' | 'severity' | 'active',
    value: string,
  ) =>
    ({
      search: setSearch,
      type: setType,
      severity: setSeverity,
      active: setActive,
    })[field](value)
  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <Radar className="size-3.5" /> Intelligence operations
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Threat Intelligence
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage the local catalog of indicators of compromise.
            </p>
          </div>
          <div className="flex gap-3">
            {canEdit ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Add indicator
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-500">
                <Eye className="size-4" />
                Read-only access
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
          <QueueSkeleton label="threat indicators" />
        ) : query.error || !query.data ? (
          <QueueError
            title="Threat intelligence unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex justify-between border-b border-slate-800/80 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  IOC catalog
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Client-side view of GET /api/threat-intelligence/indicators
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>
            {query.data.length > 0 && (
              <IndicatorToolbar
                search={search}
                type={type}
                severity={severity}
                active={active}
                onChange={change}
                onClear={() => {
                  setSearch('')
                  setType('')
                  setSeverity('')
                  setActive('')
                }}
              />
            )}
            {filtered.length ? (
              <IndicatorsTable indicators={filtered} onSelect={setSelected} />
            ) : (
              <QueueEmpty filtered={query.data.length > 0} noun="indicators" />
            )}
          </section>
        )}
        <IndicatorCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
        <IndicatorDetails
          id={selected?.id ?? null}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
        />
      </div>
    </main>
  )
}
