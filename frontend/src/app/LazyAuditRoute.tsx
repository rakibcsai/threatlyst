import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const Page = lazy(() =>
  import('../features/audit/AuditLogsPage').then((module) => ({
    default: module.AuditLogsPage,
  })),
)

export function LazyAuditRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading audit logs" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
