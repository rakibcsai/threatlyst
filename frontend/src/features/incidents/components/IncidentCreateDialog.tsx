import { useState, type FormEvent } from 'react'
import { Siren } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import type { IncidentCreate } from '../incident-types'
import { useCreateIncident } from '../useIncidents'

export function IncidentCreateDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium')
  const mutation = useCreateIncident()

  async function submit(event: FormEvent) {
    event.preventDefault()
    const payload: IncidentCreate = {
      title: title.trim(),
      description: description.trim(),
      severity,
    }
    try {
      await mutation.mutateAsync(payload)
      setTitle('')
      setDescription('')
      setSeverity('medium')
      onClose()
    } catch {
      /* rendered below */
    }
  }

  return (
    <InvestigationDrawer
      open={open}
      title="Create incident"
      eyebrow="Incident intake"
      onClose={onClose}
    >
      <form className="space-y-6" onSubmit={submit}>
        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Siren className="size-3.5 text-rose-400" /> Incident record
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                Title
              </span>
              <input
                className="field"
                required
                minLength={3}
                maxLength={255}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                Severity
              </span>
              <select
                className="field"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Description
            </span>
            <textarea
              className="field min-h-32 resize-y py-3"
              required
              minLength={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
        </div>
        {mutation.error && (
          <p
            className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-300"
            role="alert"
          >
            {getApiErrorMessage(mutation.error)}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Spinner label="Creating incident" />
            ) : (
              'Create incident'
            )}
          </Button>
        </div>
      </form>
    </InvestigationDrawer>
  )
}
