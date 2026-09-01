import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import {
  DetailItem,
  InvestigationDrawer,
} from '../../operations/components/InvestigationDrawer'
import type { MITRETechniqueResponse } from '../mitre-types'
import { useTechnique, useUpdateTechnique } from '../useMitre'
import { TacticBadge } from './TechniqueTable'

export function TechniqueDetails({
  id,
  canEdit,
  onClose,
}: {
  id: number | null
  canEdit: boolean
  onClose: () => void
}) {
  const query = useTechnique(id)
  const item = query.data
  return (
    <InvestigationDrawer
      open={id !== null}
      title={item?.name ?? `Technique ${id ?? ''}`}
      eyebrow="MITRE ATT&CK intelligence"
      description={item?.technique_id}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading technique details" />
        </div>
      ) : query.error || !item ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Technique details unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {getApiErrorMessage(query.error)}
          </p>
          <Button className="mt-5" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xl font-bold text-cyan-400">
                {item.technique_id}
              </p>
              <TacticBadge tactic={item.tactic} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">
              {item.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {item.description ?? 'No description recorded.'}
            </p>
            <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
              <DetailItem label="Database ID" value={item.id} mono />
              <DetailItem label="Technique ID" value={item.technique_id} mono />
              <DetailItem label="Tactic" value={item.tactic} />
              <DetailItem label="Source" value={item.source} />
            </dl>
          </section>
          {canEdit && <TechniqueEditor key={item.id} item={item} />}
        </>
      )}
    </InvestigationDrawer>
  )
}

function TechniqueEditor({ item }: { item: MITRETechniqueResponse }) {
  const mutation = useUpdateTechnique()
  const [name, setName] = useState(item.name)
  const [tactic, setTactic] = useState(item.tactic)
  const [source, setSource] = useState(item.source)
  const [description, setDescription] = useState(item.description ?? '')

  async function save() {
    try {
      await mutation.mutateAsync({
        id: item.id,
        update: { name, tactic, source, description },
      })
    } catch {
      /* rendered */
    }
  }

  return (
    <section className="surface-card p-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        Update technique
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Name
          </span>
          <input
            className="field"
            minLength={2}
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Tactic
          </span>
          <input
            className="field"
            minLength={2}
            maxLength={100}
            value={tactic}
            onChange={(e) => setTactic(e.target.value)}
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Source
          </span>
          <input
            className="field"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold text-slate-300">
          Description
        </span>
        <textarea
          className="field min-h-28 py-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {mutation.error && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      <Button
        className="mt-4"
        onClick={() => void save()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </section>
  )
}
