import { Eye, Network, UserRound } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import type { SecurityEvent } from '../event-types'
import { formatEventLabel, formatEventTimestamp } from '../event-utils'
import { SeverityBadge } from './SeverityBadge'

function activateEvent(
  keyboardEvent: KeyboardEvent,
  event: SecurityEvent,
  onSelect: (event: SecurityEvent) => void,
) {
  if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
  keyboardEvent.preventDefault()
  onSelect(event)
}

function Endpoint({
  source,
  destination,
}: {
  source: string | null
  destination: string | null
}) {
  return (
    <div className="space-y-1 font-mono text-[11px]">
      <p className="text-slate-300">{source ?? '—'}</p>
      <p className="text-slate-600">→ {destination ?? '—'}</p>
    </div>
  )
}

export function EventsTable({
  events,
  onSelect,
}: {
  events: SecurityEvent[]
  onSelect: (event: SecurityEvent) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Identity / host</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Event ID</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.event_id}
                role="button"
                tabIndex={0}
                aria-label={`View details for event ${event.event_id}`}
                onClick={() => onSelect(event)}
                onKeyDown={(keyboardEvent) =>
                  activateEvent(keyboardEvent, event, onSelect)
                }
                className="group cursor-pointer border-b border-slate-800/70 align-top transition-colors last:border-0 hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
              >
                <td className="whitespace-nowrap px-4 py-4 text-[11px] text-slate-500">
                  {formatEventTimestamp(event.timestamp)}
                </td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={event.severity} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs font-semibold text-slate-200">
                    {formatEventLabel(event.event_type)}
                  </p>
                  <p className="mt-1 text-[11px] text-cyan-500">
                    {event.source}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <Endpoint
                    source={event.source_ip}
                    destination={event.destination_ip}
                  />
                </td>
                <td className="px-4 py-4 text-[11px]">
                  <p className="text-slate-300">{event.username ?? '—'}</p>
                  <p className="mt-1 text-slate-600">{event.hostname ?? '—'}</p>
                </td>
                <td className="max-w-xs px-4 py-4 text-xs leading-5 text-slate-400">
                  <span className="line-clamp-2">{event.message}</span>
                </td>
                <td
                  className="max-w-44 truncate px-4 py-4 font-mono text-[11px] text-slate-600"
                  title={event.event_id}
                >
                  {event.event_id}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold text-cyan-400 transition-colors group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                    <Eye className="size-3.5" />
                    View details
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 lg:hidden">
        {events.map((event) => (
          <article
            key={event.event_id}
            role="button"
            tabIndex={0}
            aria-label={`View details for event ${event.event_id}`}
            onClick={() => onSelect(event)}
            onKeyDown={(keyboardEvent) =>
              activateEvent(keyboardEvent, event, onSelect)
            }
            className="group cursor-pointer p-4 transition-colors hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {formatEventLabel(event.event_type)}
                </p>
                <p className="mt-1 text-xs text-cyan-500">{event.source}</p>
              </div>
              <SeverityBadge severity={event.severity} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              {event.message}
            </p>
            <div className="mt-4 grid gap-3 text-[11px] text-slate-500 sm:grid-cols-2">
              <div className="flex gap-2">
                <Network className="mt-0.5 size-3.5 shrink-0" />
                <Endpoint
                  source={event.source_ip}
                  destination={event.destination_ip}
                />
              </div>
              <div className="flex gap-2">
                <UserRound className="mt-0.5 size-3.5 shrink-0" />
                <div>
                  <p>{event.username ?? 'No user'}</p>
                  <p className="mt-1 text-slate-600">
                    {event.hostname ?? 'No host'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-800/70 pt-3 text-[10px] text-slate-600">
              <span>{formatEventTimestamp(event.timestamp)}</span>
              <span className="font-mono">{event.event_id}</span>
            </div>
            <span className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-cyan-400 transition-colors group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10">
              <Eye className="size-3.5" />
              View details
            </span>
          </article>
        ))}
      </div>
    </>
  )
}
