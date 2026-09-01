import { AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import {
  DetailItem,
  InvestigationDrawer,
} from '../../operations/components/InvestigationDrawer'
import {
  formatOperationLabel,
  formatOperationTimestamp,
} from '../../operations/operation-utils'
import { useMarkNotificationRead, useNotification } from '../useNotifications'
import {
  NotificationSeverityBadge,
  NotificationTypeBadge,
  ReadStateBadge,
} from './NotificationBadges'

export function NotificationDetails({
  id,
  onClose,
}: {
  id: number | null
  onClose: () => void
}) {
  const query = useNotification(id)
  const mutation = useMarkNotificationRead()
  const item = query.data
  return (
    <InvestigationDrawer
      open={id !== null}
      title={item?.title ?? `Notification ${id ?? ''}`}
      eyebrow="SOC notification"
      description={item ? `Notification ${item.id}` : undefined}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading notification details" />
        </div>
      ) : query.error || !item ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Notification unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {getApiErrorMessage(query.error)}
          </p>
          <Button className="mt-5" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" /> Retry
          </Button>
        </div>
      ) : (
        <section className="surface-card p-5">
          <div className="flex flex-wrap gap-2">
            <ReadStateBadge read={item.is_read} />
            <NotificationTypeBadge type={item.notification_type} />
            <NotificationSeverityBadge severity={item.severity} />
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {item.message}
          </p>
          <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <DetailItem label="Notification ID" value={item.id} mono />
            <DetailItem
              label="Created"
              value={formatOperationTimestamp(item.created_at)}
            />
            <DetailItem
              label="Audience"
              value={item.user_id === null ? 'Global' : `User ${item.user_id}`}
            />
            <DetailItem
              label="Read at"
              value={
                item.read_at
                  ? formatOperationTimestamp(item.read_at)
                  : 'Not read'
              }
            />
            <DetailItem
              label="Resource type"
              value={
                item.resource_type
                  ? formatOperationLabel(item.resource_type)
                  : 'Not linked'
              }
            />
            <DetailItem
              label="Resource ID"
              value={item.resource_id ?? 'Not linked'}
              mono
            />
          </dl>
          {!item.is_read && (
            <div className="mt-5 border-t border-slate-800 pt-5">
              {mutation.error && (
                <p role="alert" className="mb-3 text-sm text-rose-300">
                  {getApiErrorMessage(mutation.error)}
                </p>
              )}
              <Button
                disabled={mutation.isPending}
                onClick={() =>
                  void mutation.mutateAsync(item.id).catch(() => undefined)
                }
              >
                <Check className="size-4" />
                {mutation.isPending ? 'Marking as read…' : 'Mark as read'}
              </Button>
            </div>
          )}
        </section>
      )}
    </InvestigationDrawer>
  )
}
