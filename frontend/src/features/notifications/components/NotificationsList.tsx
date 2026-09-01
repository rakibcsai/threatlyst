import { BellRing, Check, Eye } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import {
  activateOperation,
  formatOperationTimestamp,
} from '../../operations/operation-utils'
import type { NotificationResponse } from '../notification-types'
import {
  NotificationSeverityBadge,
  NotificationTypeBadge,
  ReadStateBadge,
} from './NotificationBadges'

export function NotificationsList({
  notifications,
  markingId,
  onSelect,
  onMarkRead,
}: {
  notifications: NotificationResponse[]
  markingId: number | null
  onSelect: (notification: NotificationResponse) => void
  onMarkRead: (id: number) => void
}) {
  const markRead = (event: React.MouseEvent, id: number) => {
    event.stopPropagation()
    onMarkRead(id)
  }
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/35 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              <th className="px-4 py-3">Notification</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((item) => (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open notification ${item.id}`}
                onClick={() => onSelect(item)}
                onKeyDown={(event) =>
                  activateOperation(event, () => onSelect(item))
                }
                className={`group cursor-pointer border-b border-slate-800/70 hover:bg-slate-800/30 focus-visible:bg-cyan-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400 ${item.is_read ? '' : 'bg-cyan-400/[0.025]'}`}
              >
                <td className="max-w-md px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${item.is_read ? 'bg-slate-800 text-slate-500' : 'bg-cyan-400/10 text-cyan-300'}`}
                    >
                      <BellRing className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm ${item.is_read ? 'font-medium text-slate-300' : 'font-semibold text-white'}`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <NotificationTypeBadge type={item.notification_type} />
                </td>
                <td className="px-4 py-4">
                  <NotificationSeverityBadge severity={item.severity} />
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {item.resource_type && item.resource_id
                    ? `${item.resource_type} · ${item.resource_id}`
                    : 'Global notice'}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                  {formatOperationTimestamp(item.created_at)}
                </td>
                <td className="px-4 py-4">
                  <ReadStateBadge read={item.is_read} />
                </td>
                <td className="px-4 py-4 text-right">
                  {item.is_read ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-cyan-400">
                      <Eye className="size-3.5" /> View
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      disabled={markingId === item.id}
                      onClick={(event) => markRead(event, item.id)}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Check className="size-3.5" />
                      {markingId === item.id ? 'Marking…' : 'Mark read'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-800 lg:hidden">
        {notifications.map((item) => (
          <article
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Open notification ${item.id}`}
            onClick={() => onSelect(item)}
            onKeyDown={(event) =>
              activateOperation(event, () => onSelect(item))
            }
            className={`cursor-pointer p-4 hover:bg-slate-800/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400 ${item.is_read ? '' : 'bg-cyan-400/[0.025]'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <ReadStateBadge read={item.is_read} />
                <h2
                  className={`mt-2 text-sm ${item.is_read ? 'font-medium text-slate-300' : 'font-semibold text-white'}`}
                >
                  {item.title}
                </h2>
              </div>
              <NotificationSeverityBadge severity={item.severity} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {item.message}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <NotificationTypeBadge type={item.notification_type} />
              <span className="text-[11px] text-slate-600">
                {formatOperationTimestamp(item.created_at)}
              </span>
            </div>
            {!item.is_read && (
              <Button
                variant="ghost"
                className="mt-3 h-8 px-2 text-xs"
                disabled={markingId === item.id}
                onClick={(event) => markRead(event, item.id)}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Check className="size-3.5" /> Mark read
              </Button>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
