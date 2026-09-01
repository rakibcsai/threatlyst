import { lazy, Suspense } from 'react'
import { Spinner } from '../components/ui/Spinner'

const Page = lazy(() =>
  import('../features/api-keys/ApiKeysPage').then((module) => ({
    default: module.ApiKeysPage,
  })),
)

export function LazyApiKeysRoute() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner label="Loading API keys" />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
