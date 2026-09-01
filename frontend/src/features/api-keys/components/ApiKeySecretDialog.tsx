import { useState } from 'react'
import { Check, Copy, ShieldAlert } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { InvestigationDrawer } from '../../operations/components/InvestigationDrawer'
import type { APIKeyCreateResponse } from '../api-key-types'

export function ApiKeySecretDialog({
  result,
  onClose,
}: {
  result: APIKeyCreateResponse | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  async function copy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.api_key)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
    }
  }
  return (
    <InvestigationDrawer
      open={result !== null}
      title="API key created"
      eyebrow="One-time secret"
      description={result?.name}
      onClose={onClose}
    >
      {result && (
        <section className="surface-card p-5">
          <div className="flex items-start gap-3 rounded-lg border border-orange-400/20 bg-orange-400/[0.07] p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-orange-300" />
            <div>
              <h2 className="text-sm font-semibold text-orange-200">
                Copy this key now
              </h2>
              <p className="mt-1 text-xs leading-5 text-orange-200/65">
                This raw API key is returned once and will not be shown again
                after this dialog closes.
              </p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Raw API key
            </span>
            <input
              aria-label="Raw API key"
              className="field font-mono text-xs"
              readOnly
              value={result.api_key}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => void copy()}>
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? 'Copied' : 'Copy key'}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              I have saved this key
            </Button>
          </div>
          {copyFailed && (
            <p role="alert" className="mt-3 text-sm text-rose-300">
              Clipboard access failed. Select and copy the key manually before
              closing.
            </p>
          )}
          <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Key ID
              </dt>
              <dd className="mt-1.5 font-mono text-xs text-slate-300">
                {result.id}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Stored prefix
              </dt>
              <dd className="mt-1.5 font-mono text-xs text-slate-300">
                {result.key_prefix}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </InvestigationDrawer>
  )
}
