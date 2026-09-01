import { useEffect, useState, type FormEvent } from 'react'
import { Braces, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import type { EventSubmission, FullEventResponse } from '../event-types'
import { useSubmitEvent } from '../useEvents'
import { AnalysisResultPanel } from './AnalysisResultPanel'

interface FormValues {
  event_id: string
  timestamp: string
  source: string
  event_type: string
  source_ip: string
  destination_ip: string
  username: string
  hostname: string
  severity: string
  message: string
  raw_data: string
}
const initialValues: FormValues = {
  event_id: '',
  timestamp: '',
  source: '',
  event_type: '',
  source_ip: '',
  destination_ip: '',
  username: '',
  hostname: '',
  severity: 'medium',
  message: '',
  raw_data: '{}',
}

function optional(value: string) {
  const trimmed = value.trim()
  return trimmed || undefined
}

export function EventSubmissionDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [values, setValues] = useState(initialValues)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [result, setResult] = useState<FullEventResponse | null>(null)
  const mutation = useSubmitEvent()

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) onClose()
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open, mutation.isPending, onClose])
  if (!open) return null

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }
  function reset() {
    setValues(initialValues)
    setValidationError(null)
    mutation.reset()
    setResult(null)
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    setValidationError(null)
    let rawData: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(values.raw_data || '{}')
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object')
        throw new Error()
      rawData = parsed as Record<string, unknown>
    } catch {
      setValidationError('Raw data must be a valid JSON object.')
      return
    }
    const payload: EventSubmission = {
      event_id: values.event_id.trim(),
      source: values.source.trim(),
      event_type: values.event_type.trim(),
      message: values.message.trim(),
      severity: values.severity,
      raw_data: rawData,
      ...(values.timestamp
        ? { timestamp: new Date(values.timestamp).toISOString() }
        : {}),
      ...(optional(values.source_ip)
        ? { source_ip: optional(values.source_ip) }
        : {}),
      ...(optional(values.destination_ip)
        ? { destination_ip: optional(values.destination_ip) }
        : {}),
      ...(optional(values.username)
        ? { username: optional(values.username) }
        : {}),
      ...(optional(values.hostname)
        ? { hostname: optional(values.hostname) }
        : {}),
    }
    try {
      setResult(await mutation.mutateAsync(payload))
    } catch {
      /* rendered from mutation state */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-dialog-title"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close event analysis"
        disabled={mutation.isPending}
      />
      <section className="relative h-full w-full max-w-4xl overflow-y-auto border-l border-slate-800 bg-[#07111a] p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-400">
              Real-time analysis
            </p>
            <h1
              id="event-dialog-title"
              className="mt-2 text-2xl font-semibold text-white"
            >
              {result ? 'Analysis result' : 'Submit security event'}
            </h1>
            {!result && (
              <p className="mt-2 text-sm text-slate-500">
                The event will be persisted and analyzed by ThreatLyst.
              </p>
            )}
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        {result ? (
          <AnalysisResultPanel result={result} onAnalyzeAnother={reset} />
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="col-span-full mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Event identity
              </legend>
              <Field
                label="Event ID"
                required
                value={values.event_id}
                onChange={(value) => update('event_id', value)}
                placeholder="evt-2026-0001"
                autoFocus
              />
              <Field
                label="Timestamp"
                value={values.timestamp}
                onChange={(value) => update('timestamp', value)}
                type="datetime-local"
                hint="Optional; server time is used when omitted"
              />
              <Field
                label="Source"
                required
                value={values.source}
                onChange={(value) => update('source', value)}
                placeholder="windows-defender"
              />
              <Field
                label="Event type"
                required
                value={values.event_type}
                onChange={(value) => update('event_type', value)}
                placeholder="failed_login"
              />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-300">
                  Severity
                </span>
                <select
                  className="field"
                  value={values.severity}
                  onChange={(event) => update('severity', event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="col-span-full mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Network and identity
              </legend>
              <Field
                label="Source IP"
                value={values.source_ip}
                onChange={(value) => update('source_ip', value)}
                placeholder="10.0.0.24"
              />
              <Field
                label="Destination IP"
                value={values.destination_ip}
                onChange={(value) => update('destination_ip', value)}
                placeholder="192.0.2.18"
              />
              <Field
                label="Username"
                value={values.username}
                onChange={(value) => update('username', value)}
                placeholder="analyst.user"
              />
              <Field
                label="Hostname"
                value={values.hostname}
                onChange={(value) => update('hostname', value)}
                placeholder="SOC-WS-014"
              />
            </fieldset>
            <fieldset className="space-y-4">
              <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Event content
              </legend>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-300">
                  Message <span className="text-rose-400">*</span>
                </span>
                <textarea
                  className="field min-h-28 resize-y py-3"
                  required
                  value={values.message}
                  onChange={(event) => update('message', event.target.value)}
                  placeholder="Describe the observed security activity"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Braces className="size-3.5 text-violet-400" />
                  Raw data
                </span>
                <textarea
                  className="field min-h-36 resize-y py-3 font-mono text-xs"
                  value={values.raw_data}
                  onChange={(event) => update('raw_data', event.target.value)}
                  spellCheck={false}
                  aria-describedby="raw-data-hint"
                />
                <span
                  id="raw-data-hint"
                  className="mt-1.5 block text-[11px] text-slate-600"
                >
                  Optional JSON object passed directly as the backend raw_data
                  field.
                </span>
              </label>
            </fieldset>
            {(validationError || mutation.error) && (
              <div
                className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
                role="alert"
              >
                {validationError ?? getApiErrorMessage(mutation.error)}
              </div>
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
                  <Spinner label="Analyzing event" />
                ) : (
                  'Submit and analyze'
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder,
  hint,
  autoFocus = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  placeholder?: string
  hint?: string
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </span>
      <input
        className="field"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {hint && (
        <span className="mt-1.5 block text-[11px] text-slate-600">{hint}</span>
      )}
    </label>
  )
}
