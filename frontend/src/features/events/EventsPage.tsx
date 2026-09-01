import { useMemo, useState } from 'react'
import { Eye, Plus, RadioTower, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { can } from '../../config/roles'
import { useAuth } from '../../hooks/useAuth'
import { EventSubmissionDialog } from './components/EventSubmissionDialog'
import {
  EventsEmpty,
  EventsError,
  EventsSkeleton,
} from './components/EventsStates'
import { EventsTable } from './components/EventsTable'
import { EventsToolbar } from './components/EventsToolbar'
import { StoredEventDetailsDialog } from './components/StoredEventDetailsDialog'
import type { SecurityEvent } from './event-types'
import { eventMatchesSearch } from './event-utils'
import { useEvents } from './useEvents'

export function EventsPage() {
  const { user } = useAuth()
  const { data, error, isLoading, isFetching, refetch } = useEvents()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [eventType, setEventType] = useState('')
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const canSubmit = Boolean(user && can.investigate(user.role))
  const eventTypes = useMemo(
    () => [...new Set((data ?? []).map((event) => event.event_type))].sort(),
    [data],
  )
  const filteredEvents = useMemo(
    () =>
      (data ?? []).filter(
        (event) =>
          eventMatchesSearch(event, search) &&
          (!severity || event.severity.toLowerCase() === severity) &&
          (!eventType || event.event_type === eventType),
      ),
    [data, eventType, search, severity],
  )

  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <RadioTower className="size-3.5" />
              Security telemetry
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white md:text-3xl">
              Security Events
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Stored event records from the ThreatLyst analysis pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canSubmit ? (
              <Button onClick={() => setSubmissionOpen(true)}>
                <Plus className="size-4" />
                Analyze event
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-500">
                <Eye className="size-4" />
                Read-only access
              </span>
            )}
            <Button
              variant="secondary"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        {isLoading ? (
          <EventsSkeleton />
        ) : error || !data ? (
          <EventsError
            error={error}
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : (
          <section className="surface-card mt-5 overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-800/80 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Event queue
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Client-side view of all records returned by GET /api/events
                </p>
              </div>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-300">
                  {filteredEvents.length}
                </span>{' '}
                of {data.length} events
              </p>
            </div>
            {data.length > 0 && (
              <EventsToolbar
                search={search}
                severity={severity}
                eventType={eventType}
                eventTypes={eventTypes}
                onSearchChange={setSearch}
                onSeverityChange={setSeverity}
                onEventTypeChange={setEventType}
                onClear={() => {
                  setSearch('')
                  setSeverity('')
                  setEventType('')
                }}
              />
            )}
            {filteredEvents.length > 0 ? (
              <EventsTable
                events={filteredEvents}
                onSelect={setSelectedEvent}
              />
            ) : (
              <EventsEmpty filtered={data.length > 0} />
            )}
          </section>
        )}
        <EventSubmissionDialog
          open={submissionOpen}
          onClose={() => setSubmissionOpen(false)}
        />
        <StoredEventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </main>
  )
}
