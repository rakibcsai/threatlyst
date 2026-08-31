import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/api-error'

export function DashboardError({
  error,
  onRetry,
  isRetrying,
}: {
  error: unknown
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
          <AlertTriangle className="size-6" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-rose-300">
          Dashboard unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Security telemetry could not be loaded
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {getApiErrorMessage(error)}
        </p>
        <Button className="mt-6" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying' : 'Try again'}
        </Button>
      </div>
    </main>
  )
}
