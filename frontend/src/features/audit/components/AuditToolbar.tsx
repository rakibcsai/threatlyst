import { Filter, Search, X } from 'lucide-react'
import { formatOperationLabel } from '../../operations/operation-utils'

export function AuditToolbar({
  search,
  status,
  action,
  resource,
  statuses,
  actions,
  resources,
  onChange,
  onClear,
}: {
  search: string
  status: string
  action: string
  resource: string
  statuses: string[]
  actions: string[]
  resources: string[]
  onChange: (
    field: 'search' | 'status' | 'action' | 'resource',
    value: string,
  ) => void
  onClear: () => void
}) {
  const hasFilters = Boolean(search || status || action || resource)
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 xl:flex-row xl:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search audit logs</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        <input
          aria-label="Search audit logs"
          className="field h-10 pl-9"
          value={search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search actor, action, resource, details, IP, or ID"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Filter audit status</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-600" />
          <select
            aria-label="Filter audit status"
            className="field h-10 min-w-36 appearance-none pl-9"
            value={status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter audit action</span>
          <select
            aria-label="Filter audit action"
            className="field h-10 min-w-44"
            value={action}
            onChange={(event) => onChange('action', event.target.value)}
          >
            <option value="">All actions</option>
            {actions.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter resource type</span>
          <select
            aria-label="Filter resource type"
            className="field h-10 min-w-40"
            value={resource}
            onChange={(event) => onChange('resource', event.target.value)}
          >
            <option value="">All resources</option>
            {resources.map((value) => (
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
