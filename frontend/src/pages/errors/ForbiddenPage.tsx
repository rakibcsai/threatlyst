import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6 text-center">
      <div>
        <ShieldX
          className="mx-auto size-10 text-amber-400"
          aria-hidden="true"
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
          403 · Access denied
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          You don’t have access to this area
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Your session is still active. Return to the dashboard or contact an
          administrator if you believe access is required.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-md text-sm font-semibold text-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
          aria-label="Return to SOC dashboard"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  )
}
