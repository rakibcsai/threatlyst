import { Search, X } from 'lucide-react'
export function TechniqueToolbar({
  search,
  tactic,
  tactics,
  onSearch,
  onTactic,
  onClear,
}: {
  search: string
  tactic: string
  tactics: string[]
  onSearch: (value: string) => void
  onTactic: (value: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search techniques</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        <input
          className="field h-10 pl-9"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search technique ID, name, tactic, or description"
        />
      </label>
      <select
        aria-label="Filter by tactic"
        className="field h-10 min-w-48"
        value={tactic}
        onChange={(e) => onTactic(e.target.value)}
      >
        <option value="">All tactics</option>
        {tactics.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {(search || tactic) && (
        <button
          className="inline-flex items-center justify-center gap-2 px-3 text-xs font-semibold text-slate-500 hover:text-white"
          onClick={onClear}
        >
          <X className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
