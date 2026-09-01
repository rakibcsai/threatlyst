import { Filter, Search, X } from 'lucide-react'
import { formatOperationLabel } from '../../operations/operation-utils'

export function NotificationToolbar({
  search,
  state,
  type,
  types,
  severity,
  severities,
  onChange,
  onClear,
}: {
  search: string
  state: string
  type: string
  types: string[]
  severity: string
  severities: string[]
  onChange: (
    field: 'search' | 'state' | 'type' | 'severity',
    value: string,
  ) => void
  onClear: () => void
}) {
  const hasFilters = Boolean(search || state || type || severity)
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 xl:flex-row xl:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search notifications</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        <input
          aria-label="Search notifications"
          className="field h-10 pl-9"
          value={search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search title, message, type, or resource reference"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Filter read state</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-600" />
          <select
            aria-label="Filter read state"
            className="field h-10 min-w-36 appearance-none pl-9"
            value={state}
            onChange={(event) => onChange('state', event.target.value)}
          >
            <option value="">All states</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter notification type</span>
          <select
            aria-label="Filter notification type"
            className="field h-10 min-w-44"
            value={type}
            onChange={(event) => onChange('type', event.target.value)}
          >
            <option value="">All types</option>
            {types.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter notification severity</span>
          <select
            aria-label="Filter notification severity"
            className="field h-10 min-w-40"
            value={severity}
            onChange={(event) => onChange('severity', event.target.value)}
          >
            <option value="">All severities</option>
            {severities.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {hasFilters && (
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          onClick={onClear}
        >
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  )
}
