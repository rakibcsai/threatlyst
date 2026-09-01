import { useEffect, useRef, type ReactNode } from 'react'
import {
  AlertTriangle,
  Braces,
  CalendarClock,
  Database,
  Laptop,
  Network,
  RadioTower,
  UserRound,
  X,
} from 'lucide-react'
import type { SecurityEvent } from '../event-types'
import { formatEventLabel, formatEventTimestamp } from '../event-utils'
import { SeverityBadge } from './SeverityBadge'

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function StoredEventDetailsDialog({
  event,
  onClose,
}: {
  event: SecurityEvent | null
  onClose: () => void
}) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!event) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault()
        onClose()
        return
      }
      if (keyboardEvent.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (keyboardEvent.shiftKey && document.activeElement === first) {
        keyboardEvent.preventDefault()
        last.focus()
      } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
        keyboardEvent.preventDefault()
        first.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [event, onClose])

  if (!event) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stored-event-title"
      aria-describedby="stored-event-description"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close stored event details"
      />
      <section
        ref={panelRef}
        className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-800 bg-[#07111a] shadow-2xl"
      >
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#07111a]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-cyan-400">
                <Database className="size-3.5" />
                Stored event record
              </p>
              <h1
                id="stored-event-title"
                className="mt-2 truncate text-xl font-semibold text-white sm:text-2xl"
              >
                {formatEventLabel(event.event_type)}
              </h1>
              <p
                id="stored-event-description"
                className="mt-2 font-mono text-xs text-slate-500"
              >
                {event.event_id}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              onClick={onClose}
              aria-label="Close stored event details"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-7">
          <section
            className="surface-card p-5"
            aria-labelledby="record-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  id="record-heading"
                  className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
                >
                  Event record
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {event.message}
                </p>
              </div>
              <SeverityBadge severity={event.severity} />
            </div>
            <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
              <Detail label="Event ID" value={event.event_id} mono />
              <Detail
                label="Timestamp"
                value={formatEventTimestamp(event.timestamp)}
                icon={<CalendarClock className="size-3.5" />}
              />
              <Detail
                label="Event type"
                value={formatEventLabel(event.event_type)}
                icon={<RadioTower className="size-3.5" />}
              />
              <Detail label="Source" value={event.source} />
            </dl>
          </section>

          <section
            className="surface-card p-5"
            aria-labelledby="network-heading"
          >
            <h2
              id="network-heading"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              <Network className="size-3.5 text-cyan-500" />
              Network context
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Source IP" value={event.source_ip} mono />
              <Detail
                label="Destination IP"
                value={event.destination_ip}
                mono
              />
            </dl>
          </section>

          <section
            className="surface-card p-5"
            aria-labelledby="identity-heading"
          >
            <h2
              id="identity-heading"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              <UserRound className="size-3.5 text-violet-400" />
              Identity and asset
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Username" value={event.username} />
              <Detail
                label="Hostname"
                value={event.hostname}
                icon={<Laptop className="size-3.5" />}
              />
            </dl>
          </section>

          <section
            className="surface-card overflow-hidden"
            aria-labelledby="raw-data-heading"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
              <Braces className="size-3.5 text-violet-400" />
              <h2
                id="raw-data-heading"
                className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Raw data
              </h2>
            </div>
            <pre className="max-h-80 overflow-auto p-5 font-mono text-xs leading-6 text-slate-300">
              <code>{JSON.stringify(event.raw_data, null, 2)}</code>
            </pre>
          </section>

          <aside className="flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/80">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p>
              Historical AI analysis is not available for this stored event.
              Full analysis is currently available only immediately after event
              submission.
            </p>
          </aside>
        </div>
      </section>
    </div>
  )
}

function Detail({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string
  value: string | null
  mono?: boolean
  icon?: ReactNode
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-1.5 break-words text-sm text-slate-300 ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? 'Not recorded'}
      </dd>
    </div>
  )
}
