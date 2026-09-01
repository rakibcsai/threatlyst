import { AlertTriangle, Inbox, RefreshCw, SearchX } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'

export function QueueSkeleton({ label }: { label: string }) {
  return (
    <div
      className="surface-card mt-5 animate-pulse overflow-hidden"
      aria-label={`Loading ${label}`}
      aria-busy="true"
    >
      <div className="h-16 border-b border-slate-800 bg-slate-900/40" />
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="grid h-20 grid-cols-5 items-center gap-5 border-b border-slate-800/70 px-4 last:border-0"
        >
          {Array.from({ length: 5 }, (_, cell) => (
            <span key={cell} className="h-3 rounded bg-slate-800" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function QueueError({
  title,
  error,
  onRetry,
  isRetrying,
}: {
  title: string
  error: unknown
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <section
      className="surface-card mt-5 grid min-h-80 place-items-center p-8 text-center"
      aria-live="assertive"
    >
      <div className="max-w-md">
        <AlertTriangle className="mx-auto size-9 text-rose-400" />
        <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {getApiErrorMessage(error)}
        </p>
        <Button className="mt-5" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying' : 'Try again'}
        </Button>
      </div>
    </section>
  )
}

export function QueueEmpty({
  filtered,
  noun,
}: {
  filtered: boolean
  noun: string
}) {
  const Icon = filtered ? SearchX : Inbox
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div className="max-w-sm">
        <Icon className="mx-auto size-9 text-slate-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-200">
          {filtered ? `No matching ${noun}` : `No ${noun} yet`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {filtered
            ? 'Adjust or clear the client-side filters to broaden this view.'
            : `New ${noun} will appear here when they are created in ThreatLyst.`}
        </p>
      </div>
    </div>
  )
}
