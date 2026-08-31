export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-3 text-sm text-slate-400" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      {label}
    </span>
  )
}
