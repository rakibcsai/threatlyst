import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const AlertsPage = lazy(() =>
  import('../features/alerts/AlertsPage').then((module) => ({
    default: module.AlertsPage,
  })),
)

export function LazyAlertsRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading alerts" />
        </div>
      }
    >
      <AlertsPage />
    </Suspense>
  )
}
