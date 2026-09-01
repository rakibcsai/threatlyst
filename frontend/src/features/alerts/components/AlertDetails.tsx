import {
  AlertTriangle,
  Link2,
  RefreshCw,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import { SeverityBadge } from '../../events/components/SeverityBadge'
import {
  DetailItem,
  InvestigationDrawer,
} from '../../operations/components/InvestigationDrawer'
import { StatusBadge } from '../../operations/components/StatusBadge'
import {
  formatOperationLabel,
  formatOperationTimestamp,
} from '../../operations/operation-utils'
import { alertStatuses, type AlertStatus } from '../alert-types'
import { useAlert, useUpdateAlert } from '../useAlerts'

export function AlertDetails({
  alertId,
  canEdit,
  onClose,
}: {
  alertId: number | null
  canEdit: boolean
  onClose: () => void
}) {
  const query = useAlert(alertId)
  const mutation = useUpdateAlert()
  const alert = query.data

  async function updateStatus(status: AlertStatus) {
    if (alertId === null) return
    try {
      await mutation.mutateAsync({ alertId, update: { status } })
    } catch {
      /* mutation error is rendered */
    }
  }

  return (
    <InvestigationDrawer
      open={alertId !== null}
      title={alert?.title ?? `Alert ${alertId ?? ''}`}
      eyebrow="Alert investigation"
      description={alert ? `ALT-${alert.id}` : undefined}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading alert details" />
        </div>
      ) : query.error || !alert ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Alert details unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {getApiErrorMessage(query.error)}
          </p>
          <Button className="mt-5" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" /> Retry
          </Button>
        </div>
      ) : (
        <>
          <section className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Investigation summary
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {alert.description}
                </p>
              </div>
              <div className="flex gap-2">
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
              </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
              <DetailItem label="Alert ID" value={alert.id} mono />
              <DetailItem label="Title" value={alert.title} />
              <DetailItem label="Severity" value={alert.severity} />
              <DetailItem
                label="Status"
                value={formatOperationLabel(alert.status)}
              />
              <DetailItem
                label="Created"
                value={
                  <time dateTime={alert.created_at} title={alert.created_at}>
                    {formatOperationTimestamp(alert.created_at)}
                  </time>
                }
              />
              <DetailItem
                label="Last updated"
                value={
                  <time dateTime={alert.updated_at} title={alert.updated_at}>
                    {formatOperationTimestamp(alert.updated_at)}
                  </time>
                }
              />
            </dl>
          </section>

          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <Link2 className="size-3.5 text-cyan-500" /> Source reference
            </h2>
            <dl className="mt-4">
              <DetailItem label="Event ID" value={alert.event_id} mono />
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              The alert API exposes an event identifier only. Related event
              details are not embedded in this response.
            </p>
          </section>

          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <UserRound className="size-3.5 text-violet-400" /> Assignment
            </h2>
            <dl className="mt-4">
              <DetailItem
                label="Assigned user ID"
                value={alert.assigned_to_user_id}
                mono
              />
            </dl>
            <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-xs leading-5 text-amber-100/70">
              Assignment changes are unavailable until the backend provides a
              user directory lookup. Raw user IDs are display-only.
            </p>
          </section>

          {canEdit && (
            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <ShieldAlert className="size-3.5 text-cyan-500" /> Workflow
                status
              </h2>
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold text-slate-300">
                  Alert status
                </span>
                <select
                  className="field"
                  value={alert.status}
                  disabled={mutation.isPending}
                  onChange={(event) =>
                    void updateStatus(event.target.value as AlertStatus)
                  }
                >
                  {alertStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatOperationLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              {mutation.isPending && (
                <p className="mt-3 text-xs text-slate-500">Updating status…</p>
              )}
              {mutation.error && (
                <p className="mt-3 text-sm text-rose-300" role="alert">
                  {getApiErrorMessage(mutation.error)}
                </p>
              )}
            </section>
          )}
        </>
      )}
    </InvestigationDrawer>
  )
}
