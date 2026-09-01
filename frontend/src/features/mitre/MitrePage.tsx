import { useMemo, useState } from 'react'
import { Eye, Plus, RefreshCw, Shield } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { can } from '../../config/roles'
import { useAuth } from '../../hooks/useAuth'
import {
  QueueEmpty,
  QueueError,
  QueueSkeleton,
} from '../operations/components/QueueStates'
import { matchesOperationSearch } from '../operations/operation-utils'
import { TechniqueCreateDialog } from './components/TechniqueCreateDialog'
import { TechniqueDetails } from './components/TechniqueDetails'
import { TechniqueTable } from './components/TechniqueTable'
import { TechniqueToolbar } from './components/TechniqueToolbar'
import type { MITRETechniqueResponse } from './mitre-types'
import { useTechniques } from './useMitre'
export function MitrePage() {
  const { user } = useAuth()
  const query = useTechniques()
  const [search, setSearch] = useState('')
  const [tactic, setTactic] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<MITRETechniqueResponse | null>(null)
  const canEdit = Boolean(user && can.investigate(user.role))
  const tactics = useMemo(
    () => [...new Set((query.data ?? []).map((item) => item.tactic))].sort(),
    [query.data],
  )
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (item) =>
          matchesOperationSearch(
            [
              item.id,
              item.technique_id,
              item.name,
              item.tactic,
              item.description,
              item.source,
            ],
            search,
          ) &&
          (!tactic || item.tactic === tactic),
      ),
    [query.data, search, tactic],
  )
  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <Shield className="size-3.5" /> Adversary intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              MITRE ATT&CK
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Curate the local technique and tactic reference catalog.
            </p>
          </div>
          <div className="flex gap-3">
            {canEdit ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Add technique
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
          <QueueSkeleton label="MITRE techniques" />
        ) : query.error || !query.data ? (
          <QueueError
            title="MITRE catalog unavailable"
            error={query.error}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex justify-between border-b border-slate-800/80 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Technique catalog
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Client-side view of GET /api/mitre/techniques
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {filtered.length} of {query.data.length}
              </p>
            </div>
            {query.data.length > 0 && (
              <TechniqueToolbar
                search={search}
                tactic={tactic}
                tactics={tactics}
                onSearch={setSearch}
                onTactic={setTactic}
                onClear={() => {
                  setSearch('')
                  setTactic('')
                }}
              />
            )}
            {filtered.length ? (
              <TechniqueTable techniques={filtered} onSelect={setSelected} />
            ) : (
              <QueueEmpty filtered={query.data.length > 0} noun="techniques" />
            )}
          </section>
        )}
        <TechniqueCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
        <TechniqueDetails
          id={selected?.id ?? null}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
        />
      </div>
    </main>
  )
}
