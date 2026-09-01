import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const Page = lazy(() =>
  import('../features/notifications/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  })),
)

export function LazyNotificationsRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading notifications" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
