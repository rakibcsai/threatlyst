import { ShieldCheck } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span>
          <span className="block text-[15px] font-bold tracking-wide text-white">
            ThreatLyst
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-500">
            Security operations
          </span>
        </span>
      )}
    </div>
  )
}
