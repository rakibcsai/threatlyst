import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const IncidentsPage = lazy(() =>
  import('../features/incidents/IncidentsPage').then((module) => ({
    default: module.IncidentsPage,
  })),
)

export function LazyIncidentsRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading incidents" />
        </div>
      }
    >
      <IncidentsPage />
    </Suspense>
  )
}
