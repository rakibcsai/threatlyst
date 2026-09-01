import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import { useCreateTechnique } from '../useMitre'
export function TechniqueCreateDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [techniqueId, setTechniqueId] = useState('')
  const [name, setName] = useState('')
  const [tactic, setTactic] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('MITRE ATT&CK')
  const mutation = useCreateTechnique()
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({
        technique_id: techniqueId.trim(),
        name: name.trim(),
        tactic: tactic.trim(),
        description: description.trim() || null,
        source: source.trim(),
      })
      setTechniqueId('')
      setName('')
      setTactic('')
      setDescription('')
      setSource('MITRE ATT&CK')
      onClose()
    } catch {
      /* rendered */
    }
  }
  return (
    <InvestigationDrawer
      open={open}
      title="Add ATT&CK technique"
      eyebrow="MITRE catalog intake"
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={submit}>
        <section className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <Field
            label="Technique ID"
            value={techniqueId}
            onChange={setTechniqueId}
            min={3}
            max={30}
          />
          <Field
            label="Name"
            value={name}
            onChange={setName}
            min={2}
            max={255}
          />
          <Field
            label="Tactic"
            value={tactic}
            onChange={setTactic}
            min={2}
            max={100}
          />
          <Field label="Source" value={source} onChange={setSource} min={1} />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Description
            </span>
            <textarea
              className="field min-h-28 py-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </section>
        {mutation.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-300"
          >
            {getApiErrorMessage(mutation.error)}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding…' : 'Add technique'}
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
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min: number
  max?: number
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold text-slate-300">
        {label}
      </span>
      <input
        className="field"
        required
        minLength={min}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
