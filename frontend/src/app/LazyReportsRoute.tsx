import { lazy, Suspense } from 'react'
import { DashboardSkeleton } from '../features/dashboard/components/DashboardSkeleton'

const Page = lazy(() =>
  import('../features/reports/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  })),
)

export function LazyReportsRoute() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Page />
    </Suspense>
  )
}
