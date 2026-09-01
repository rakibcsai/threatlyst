import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import { formatOperationLabel } from '../../operations/operation-utils'
import {
  indicatorTypes,
  threatSeverities,
  type IndicatorType,
  type ThreatSeverity,
} from '../indicator-types'
import { useCreateIndicator } from '../useIndicators'

export function IndicatorCreateDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [type, setType] = useState<IndicatorType>('ip')
  const [value, setValue] = useState('')
  const [source, setSource] = useState('')
  const [threatType, setThreatType] = useState('')
  const [confidence, setConfidence] = useState(50)
  const [severity, setSeverity] = useState<ThreatSeverity>('medium')
  const [description, setDescription] = useState('')
  const mutation = useCreateIndicator()
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({
        indicator_type: type,
        indicator_value: value.trim(),
        source: source.trim(),
        threat_type: threatType.trim() || null,
        confidence,
        severity,
        description: description.trim() || null,
      })
      setValue('')
      setSource('')
      setThreatType('')
      setConfidence(50)
      setSeverity('medium')
      setDescription('')
      onClose()
    } catch {
      /* rendered */
    }
  }
  return (
    <InvestigationDrawer
      open={open}
      title="Add threat indicator"
      eyebrow="IOC intake"
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={submit}>
        <section className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Indicator type
            </span>
            <select
              className="field"
              value={type}
              onChange={(e) => setType(e.target.value as IndicatorType)}
            >
              {indicatorTypes.map((item) => (
                <option key={item} value={item}>
                  {formatOperationLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Indicator value
            </span>
            <input
              className="field"
              required
              maxLength={500}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Source
            </span>
            <input
              className="field"
              required
              minLength={2}
              maxLength={255}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Threat type
            </span>
            <input
              className="field"
              maxLength={100}
              value={threatType}
              onChange={(e) => setThreatType(e.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Confidence
            </span>
            <input
              className="field"
              type="number"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Severity
            </span>
            <select
              className="field"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ThreatSeverity)}
            >
              {threatSeverities.map((item) => (
                <option key={item} value={item}>
                  {formatOperationLabel(item)}
                </option>
              ))}
            </select>
          </label>
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
            {mutation.isPending ? 'Adding…' : 'Add indicator'}
          </Button>
        </div>
      </form>
    </InvestigationDrawer>
  )
}
