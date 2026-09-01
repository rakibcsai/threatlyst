import {
  BrainCircuit,
  CheckCircle2,
  Crosshair,
  Gauge,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import type { FullEventResponse } from '../event-types'
import { formatEventLabel } from '../event-utils'
import { SeverityBadge } from './SeverityBadge'

function Score({ value, scale = 100 }: { value: number; scale?: number }) {
  const percent = Math.max(0, Math.min(100, (value / scale) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-white">
          {scale === 1 ? `${Math.round(value * 100)}%` : value}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Risk score
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function ItemList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0)
    return <p className="text-xs italic text-slate-600">{empty}</p>
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-2 text-xs leading-5 text-slate-400"
        >
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-cyan-500" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function AnalysisResultPanel({
  result,
  onAnalyzeAnother,
}: {
  result: FullEventResponse
  onAnalyzeAnother: () => void
}) {
  const { rule_analysis: rule, ai_analysis: ai } = result
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-400">
            <Sparkles className="size-3.5" />
            Analysis complete
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {result.event_type}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-slate-600">
            {result.event_id}
          </p>
        </div>
        <button
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          onClick={onAnalyzeAnother}
        >
          Analyze another event
        </button>
      </div>
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-xs leading-5 text-amber-200/70">
        This full analysis is available from the current submission response
        only. Historical analysis cannot be reopened from the stored-event list.
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-950/35 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              <ShieldAlert className="size-4 text-orange-400" />
              Rule analysis
            </div>
            <SeverityBadge severity={rule.risk_level} />
          </div>
          <div className="mt-5">
            <Score value={rule.risk_score} />
          </div>
          <div className="mt-5 border-t border-slate-800 pt-4">
            <h3 className="mb-3 text-xs font-semibold text-slate-300">
              Detection rationale
            </h3>
            <ItemList
              items={rule.reasons}
              empty="No detection-rule reasons returned."
            />
          </div>
        </section>
        <section className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.025] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              <BrainCircuit className="size-4 text-cyan-400" />
              AI analysis
            </div>
            <SeverityBadge severity={ai.risk_level} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Verdict
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatEventLabel(ai.verdict)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Confidence
              </p>
              <p className="mt-1 text-lg font-semibold text-cyan-300">
                {Math.round(ai.confidence * 100)}%
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Score value={ai.risk_score} scale={1} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Attack category
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-300">
                {formatEventLabel(ai.attack_category)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Anomaly score
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-slate-300">
                {ai.anomaly_score.toFixed(3)}
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="rounded-xl border border-slate-800 bg-slate-950/35 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          <Gauge className="size-4 text-violet-400" />
          AI explanation
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {ai.explanation}
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-800 p-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Crosshair className="size-4 text-rose-400" />
            Indicators
          </h3>
          <div className="mt-3">
            <ItemList items={ai.indicators} empty="No indicators returned." />
          </div>
        </section>
        <section className="rounded-xl border border-slate-800 p-4">
          <h3 className="text-xs font-semibold text-slate-300">
            MITRE ATT&CK mapping
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ai.mitre_techniques.length > 0 ? (
              ai.mitre_techniques.map((technique) => (
                <span
                  key={technique}
                  className="rounded-md border border-violet-400/20 bg-violet-400/10 px-2 py-1 font-mono text-[11px] text-violet-300"
                >
                  {technique}
                </span>
              ))
            ) : (
              <p className="text-xs italic text-slate-600">
                No techniques returned.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-slate-800 p-4">
          <h3 className="text-xs font-semibold text-slate-300">
            Recommended actions
          </h3>
          <div className="mt-3">
            <ItemList
              items={ai.recommended_actions}
              empty="No actions returned."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
