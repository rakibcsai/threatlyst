import { Ban, TriangleAlert } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import type { APIKeyResponse } from '../api-key-types'
import { useRevokeApiKey } from '../useApiKeys'

export function ApiKeyRevokeDialog({
  target,
  onClose,
  onRevoked,
}: {
  target: APIKeyResponse | null
  onClose: () => void
  onRevoked: () => void
}) {
  const mutation = useRevokeApiKey()
  async function revoke() {
    if (!target) return
    try {
      await mutation.mutateAsync(target.id)
      onRevoked()
      onClose()
    } catch {
      /* rendered */
    }
  }
  return (
    <InvestigationDrawer
      open={target !== null}
      title="Revoke API key"
      eyebrow="Credential control"
      description={target?.name}
      onClose={onClose}
    >
      {target && (
        <section className="surface-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-rose-400/20 bg-rose-400/10 text-rose-300">
              <TriangleAlert className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Revoke this integration credential?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Requests using{' '}
                <span className="font-semibold text-slate-300">
                  {target.name}
                </span>{' '}
                will stop authenticating immediately. The record remains visible
                as revoked.
              </p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Key ID
              </dt>
              <dd className="mt-1.5 font-mono text-xs text-slate-300">
                {target.id}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Stored prefix
              </dt>
              <dd className="mt-1.5 font-mono text-xs text-slate-300">
                {target.key_prefix}
              </dd>
            </div>
          </dl>
          {mutation.error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-300"
            >
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-400 text-slate-950 hover:bg-rose-300"
              onClick={() => void revoke()}
              disabled={mutation.isPending}
            >
              <Ban className="size-4" />
              {mutation.isPending ? 'Revoking…' : 'Confirm revoke'}
            </Button>
          </div>
        </section>
      )}
    </InvestigationDrawer>
  )
}
