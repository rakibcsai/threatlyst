import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'
const Page = lazy(() =>
  import('../features/mitre/MitrePage').then((module) => ({
    default: module.MitrePage,
  })),
)
export function LazyMitreRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading MITRE intelligence" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
