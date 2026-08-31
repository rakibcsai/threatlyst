import { lazy, Suspense } from 'react'
import { DashboardSkeleton } from '../features/dashboard/components/DashboardSkeleton'

const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)

export function LazyDashboardRoute() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  )
}
