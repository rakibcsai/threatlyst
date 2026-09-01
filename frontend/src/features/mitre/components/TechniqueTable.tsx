import { Eye, Shield } from 'lucide-react'
import { activateOperation } from '../../operations/operation-utils'
import type { MITRETechniqueResponse } from '../mitre-types'
export function TacticBadge({ tactic }: { tactic: string }) {
  return (
    <span className="inline-flex rounded-md border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-300">
      {tactic}
    </span>
  )
}
export function TechniqueTable({
  techniques,
  onSelect,
}: {
  techniques: MITRETechniqueResponse[]
  onSelect: (item: MITRETechniqueResponse) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Technique ID</th>
              <th className="px-4 py-3">Technique</th>
              <th className="px-4 py-3">Tactic</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {techniques.map((item) => (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open technique ${item.technique_id}`}
                onClick={() => onSelect(item)}
                onKeyDown={(event) =>
                  activateOperation(event, () => onSelect(item))
                }
                className="group cursor-pointer border-b border-slate-800/70 hover:bg-slate-800/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
              >
                <td className="px-4 py-4 font-mono text-sm font-bold text-cyan-400">
                  {item.technique_id}
                </td>
                <td className="max-w-xl px-4 py-4">
                  <p className="text-sm font-semibold text-slate-200">
                    {item.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {item.description ?? 'No description recorded.'}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <TacticBadge tactic={item.tactic} />
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {item.source}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400">
                    <Eye className="size-3.5" />
                    View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {techniques.map((item) => (
          <article
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Open technique ${item.technique_id}`}
            onClick={() => onSelect(item)}
            onKeyDown={(event) =>
              activateOperation(event, () => onSelect(item))
            }
            className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:border-cyan-400/30 focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <div className="flex justify-between gap-3">
              <p className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
                <Shield className="size-4" />
                {item.technique_id}
              </p>
              <TacticBadge tactic={item.tactic} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-200">
              {item.name}
            </h3>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {item.description ?? 'No description recorded.'}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
