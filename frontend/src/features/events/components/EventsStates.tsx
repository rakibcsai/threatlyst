import { AlertTriangle, Inbox, RefreshCw, SearchX } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'

export function EventsSkeleton() {
  return (
    <div
      className="surface-card mt-5 animate-pulse overflow-hidden"
      aria-label="Loading security events"
      aria-busy="true"
    >
      <div className="h-16 border-b border-slate-800 bg-slate-900/40" />
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="grid h-20 grid-cols-6 items-center gap-5 border-b border-slate-800/70 px-4 last:border-0"
        >
          <span className="h-3 rounded bg-slate-800" />
          <span className="h-6 w-16 rounded bg-slate-800" />
          <span className="h-3 rounded bg-slate-800" />
          <span className="h-3 rounded bg-slate-800" />
          <span className="h-3 rounded bg-slate-800" />
          <span className="h-3 rounded bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

export function EventsError({
  error,
  onRetry,
  isRetrying,
}: {
  error: unknown
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <section className="surface-card mt-5 grid min-h-80 place-items-center p-8 text-center">
      <div className="max-w-md">
        <AlertTriangle className="mx-auto size-9 text-rose-400" />
        <h2 className="mt-4 text-xl font-semibold text-white">
          Security events unavailable
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {getApiErrorMessage(error)}
        </p>
        <Button className="mt-5" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Try again
        </Button>
      </div>
    </section>
  )
}

export function EventsEmpty({ filtered }: { filtered: boolean }) {
  const Icon = filtered ? SearchX : Inbox
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div className="max-w-sm">
        <Icon className="mx-auto size-9 text-slate-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-200">
          {filtered ? 'No matching events' : 'No security events yet'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {filtered
            ? 'Adjust or clear the client-side filters to broaden this view.'
            : 'Stored events will appear here after ThreatLyst receives and analyzes security telemetry.'}
        </p>
      </div>
    </div>
  )
}
