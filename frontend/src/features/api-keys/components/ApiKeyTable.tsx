import { Ban, KeyRound, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { APIKeyResponse } from '../api-key-types'

export function ApiKeyStateBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${active ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300' : 'border-slate-600 bg-slate-800 text-slate-400'}`}
    >
      {active ? 'Active' : 'Revoked'}
    </span>
  )
}

export function ApiKeyTable({
  keys,
  onRevoke,
}: {
  keys: APIKeyResponse[]
  onRevoke: (key: APIKeyResponse) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Stored prefix</th>
              <th className="px-4 py-3">Created by</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-slate-800/70">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-9 place-items-center rounded-lg ${key.is_active ? 'bg-cyan-400/10 text-cyan-300' : 'bg-slate-800 text-slate-600'}`}
                    >
                      <KeyRound className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {key.name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-slate-600">
                        KEY-{key.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-400">
                  {key.key_prefix}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                    <UserRound className="size-3.5 text-slate-600" /> User{' '}
                    {key.created_by_user_id}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ApiKeyStateBadge active={key.is_active} />
                </td>
                <td className="px-4 py-4 text-right">
                  {key.is_active ? (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                      onClick={() => onRevoke(key)}
                    >
                      <Ban className="size-3.5" /> Revoke
                    </Button>
                  ) : (
                    <span className="px-2 text-xs text-slate-600">
                      No actions
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 md:hidden">
        {keys.map((key) => (
          <article key={key.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <KeyRound className="size-4 shrink-0 text-cyan-400" />
                <h2 className="truncate text-sm font-semibold text-slate-200">
                  {key.name}
                </h2>
              </div>
              <ApiKeyStateBadge active={key.is_active} />
            </div>
            <p className="mt-3 font-mono text-xs text-slate-400">
              {key.key_prefix}
            </p>
            <p className="mt-2 text-[11px] text-slate-600">
              Key {key.id} · Created by user {key.created_by_user_id}
            </p>
            {key.is_active && (
              <Button
                variant="ghost"
                className="mt-3 h-8 px-2 text-xs text-rose-300"
                onClick={() => onRevoke(key)}
              >
                <Ban className="size-3.5" /> Revoke key
              </Button>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
