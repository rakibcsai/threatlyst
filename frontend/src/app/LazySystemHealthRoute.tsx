import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const Page = lazy(() =>
  import('../features/system-health/SystemHealthPage').then((module) => ({
    default: module.SystemHealthPage,
  })),
)

export function LazySystemHealthRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading system health" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
