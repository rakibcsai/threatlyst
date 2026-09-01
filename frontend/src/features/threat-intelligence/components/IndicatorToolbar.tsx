import { Search, X } from 'lucide-react'
import { formatOperationLabel } from '../../operations/operation-utils'
import { indicatorTypes } from '../indicator-types'

export function IndicatorToolbar({
  search,
  type,
  severity,
  active,
  onChange,
  onClear,
}: {
  search: string
  type: string
  severity: string
  active: string
  onChange: (
    field: 'search' | 'type' | 'severity' | 'active',
    value: string,
  ) => void
  onClear: () => void
}) {
  const filtered = Boolean(search || type || severity || active)
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 xl:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search indicators</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        <input
          className="field h-10 pl-9"
          value={search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search IOC value, threat type, source, or description"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          aria-label="Filter by indicator type"
          className="field h-10"
          value={type}
          onChange={(e) => onChange('type', e.target.value)}
        >
          <option value="">All IOC types</option>
          {indicatorTypes.map((value) => (
            <option key={value} value={value}>
              {formatOperationLabel(value)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by severity"
          className="field h-10"
          value={severity}
          onChange={(e) => onChange('severity', e.target.value)}
        >
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          aria-label="Filter by active state"
          className="field h-10"
          value={active}
          onChange={(e) => onChange('active', e.target.value)}
        >
          <option value="">Any state</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {filtered && (
        <button
          className="inline-flex h-10 items-center justify-center gap-2 px-3 text-xs font-semibold text-slate-500 hover:text-white"
          onClick={onClear}
        >
          <X className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
