import { Filter, Search, X } from 'lucide-react'
import { formatOperationLabel } from '../operation-utils'

export function QueueToolbar({
  noun,
  search,
  severity,
  status,
  statuses,
  onSearchChange,
  onSeverityChange,
  onStatusChange,
  onClear,
}: {
  noun: 'alerts' | 'incidents'
  search: string
  severity: string
  status: string
  statuses: readonly string[]
  onSearchChange: (value: string) => void
  onSeverityChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
}) {
  const hasFilters = Boolean(search || severity || status)
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search returned {noun}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        <input
          className="field h-10 pl-9"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Search ${noun} by ID, title, description, or owner reference`}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative">
          <span className="sr-only">Filter by severity</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-600" />
          <select
            className="field h-10 min-w-40 appearance-none pl-9"
            value={severity}
            onChange={(event) => onSeverityChange(event.target.value)}
          >
            <option value="">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            className="field h-10 min-w-44"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            onClick={onClear}
          >
            <X className="size-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
