import { RadioTower } from 'lucide-react'

export function DashboardEmpty() {
  return (
    <section className="surface-card mt-6 grid min-h-80 place-items-center p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <RadioTower className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-white">
          Awaiting security telemetry
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          ThreatLyst is connected, but no security events have been analyzed
          yet. Dashboard intelligence will appear as events are ingested.
        </p>
      </div>
    </section>
  )
}
