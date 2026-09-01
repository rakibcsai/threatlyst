import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage({
  authenticated = false,
}: {
  authenticated?: boolean
}) {
  return (
    <main
      className={`grid place-items-center p-6 text-center text-slate-100 ${authenticated ? 'min-h-[calc(100vh-4rem)]' : 'min-h-screen bg-slate-950'}`}
    >
      <div>
        <SearchX className="mx-auto size-10 text-slate-600" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          404 · Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          This route does not exist
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The requested ThreatLyst surface could not be located.
        </p>
        <Link
          to={authenticated ? '/dashboard' : '/'}
          className="mt-6 inline-flex rounded-md text-sm font-semibold text-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
        >
          {authenticated ? 'Return to dashboard' : 'Return to ThreatLyst'}
        </Link>
      </div>
    </main>
  )
}
