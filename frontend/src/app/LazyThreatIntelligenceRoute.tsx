import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'
const Page = lazy(() =>
  import('../features/threat-intelligence/ThreatIntelligencePage').then(
    (module) => ({ default: module.ThreatIntelligencePage }),
  ),
)
export function LazyThreatIntelligenceRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading threat intelligence" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
