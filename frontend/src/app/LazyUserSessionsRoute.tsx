import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const Page = lazy(() =>
  import('../features/user-sessions/UserSessionsPage').then((module) => ({
    default: module.UserSessionsPage,
  })),
)

export function LazyUserSessionsRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading user sessions" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
