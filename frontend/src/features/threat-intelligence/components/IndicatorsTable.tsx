import { Eye, Radar } from 'lucide-react'
import { SeverityBadge } from '../../events/components/SeverityBadge'
import { activateOperation } from '../../operations/operation-utils'
import type { ThreatIndicatorResponse } from '../indicator-types'
import {
  ActiveBadge,
  ConfidenceBadge,
  IndicatorTypeBadge,
} from './IndicatorBadges'

export function IndicatorsTable({
  indicators,
  onSelect,
}: {
  indicators: ThreatIndicatorResponse[]
  onSelect: (item: ThreatIndicatorResponse) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Indicator</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((item) => (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open indicator ${item.id}`}
                onClick={() => onSelect(item)}
                onKeyDown={(event) =>
                  activateOperation(event, () => onSelect(item))
                }
                className="group cursor-pointer border-b border-slate-800/70 hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
              >
                <td className="max-w-sm px-4 py-4">
                  <p className="break-all font-mono text-xs font-semibold text-slate-200">
                    {item.indicator_value}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600">
                    IOC-{item.id} · {item.source}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <IndicatorTypeBadge type={item.indicator_type} />
                </td>
                <td className="px-4 py-4 text-xs text-slate-400">
                  {item.threat_type ?? 'Unclassified'}
                </td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={item.severity} />
                </td>
                <td className="px-4 py-4">
                  <ConfidenceBadge value={item.confidence} />
                </td>
                <td className="px-4 py-4">
                  <ActiveBadge active={item.is_active} />
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-cyan-400 group-hover:bg-cyan-400/10">
                    <Eye className="size-3.5" />
                    View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 lg:hidden">
        {indicators.map((item) => (
          <article
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Open indicator ${item.id}`}
            onClick={() => onSelect(item)}
            onKeyDown={(event) =>
              activateOperation(event, () => onSelect(item))
            }
            className="cursor-pointer p-4 hover:bg-slate-800/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 break-all font-mono text-xs font-semibold text-slate-200">
                <Radar className="size-4 shrink-0 text-cyan-400" />
                {item.indicator_value}
              </p>
              <SeverityBadge severity={item.severity} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <IndicatorTypeBadge type={item.indicator_type} />
              <ConfidenceBadge value={item.confidence} />
              <ActiveBadge active={item.is_active} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {item.threat_type ?? 'Unclassified'} · {item.source}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
