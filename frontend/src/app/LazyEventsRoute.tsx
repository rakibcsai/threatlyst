import { lazy, Suspense } from 'react'
import { EventsSkeleton } from '../features/events/components/EventsStates'

const EventsPage = lazy(() =>
  import('../features/events/EventsPage').then((module) => ({
    default: module.EventsPage,
  })),
)

export function LazyEventsRoute() {
  return (
    <Suspense
      fallback={
        <main className="p-5 md:p-7 xl:p-8">
          <div className="mx-auto max-w-[1600px]">
            <EventsSkeleton />
          </div>
        </main>
      }
    >
      <EventsPage />
    </Suspense>
  )
}
