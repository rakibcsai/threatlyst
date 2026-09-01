import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import type { APIKeyCreateResponse } from '../api-key-types'
import { useCreateApiKey } from '../useApiKeys'

export function ApiKeyCreateDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (result: APIKeyCreateResponse) => void
}) {
  const [name, setName] = useState('')
  const mutation = useCreateApiKey()
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      const result = await mutation.mutateAsync({ name: name.trim() })
      setName('')
      onClose()
      onCreated(result)
    } catch {
      /* rendered */
    }
  }
  return (
    <InvestigationDrawer
      open={open}
      title="Create API key"
      eyebrow="Integration credentials"
      onClose={onClose}
    >
      <form className="space-y-6" onSubmit={submit}>
        <section className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <KeyRound className="size-3.5 text-cyan-500" /> Key identity
          </h2>
          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Name
            </span>
            <input
              aria-label="API key name"
              className="field"
              required
              minLength={3}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="SIEM ingestion"
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            Use a descriptive name for the external integration. The backend
            does not support scopes or expiry.
          </p>
        </section>
        {mutation.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-300"
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
              <Spinner label="Creating API key" />
            ) : (
              'Create API key'
            )}
          </Button>
        </div>
      </form>
    </InvestigationDrawer>
  )
}
