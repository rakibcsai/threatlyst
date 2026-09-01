import { useState, type FormEvent } from 'react'
import { BellPlus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import type { AlertCreate } from '../alert-types'
import { useCreateAlert } from '../useAlerts'

export function AlertCreateDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [eventId, setEventId] = useState('')
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const mutation = useCreateAlert()

  async function submit(event: FormEvent) {
    event.preventDefault()
    const payload: AlertCreate = {
      event_id: eventId.trim(),
      title: title.trim(),
      severity,
      description: description.trim(),
    }
    try {
      await mutation.mutateAsync(payload)
      setEventId('')
      setTitle('')
      setSeverity('medium')
      setDescription('')
      onClose()
    } catch {
      /* mutation error is rendered */
    }
  }

  return (
    <InvestigationDrawer
      open={open}
      title="Create alert"
      eyebrow="Alert intake"
      onClose={onClose}
    >
      <form className="space-y-6" onSubmit={submit}>
        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <BellPlus className="size-3.5 text-cyan-500" /> Alert record
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Event ID"
              value={eventId}
              onChange={setEventId}
              minLength={1}
            />
            <Field
              label="Title"
              value={title}
              onChange={setTitle}
              minLength={3}
              maxLength={255}
            />
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
              <Spinner label="Creating alert" />
            ) : (
              'Create alert'
            )}
          </Button>
        </div>
      </form>
    </InvestigationDrawer>
  )
}

function Field({
  label,
  value,
  onChange,
  minLength,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  minLength: number
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-300">
        {label}
      </span>
      <input
        className="field"
        required
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
