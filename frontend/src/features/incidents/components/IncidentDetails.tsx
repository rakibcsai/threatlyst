import { AlertTriangle, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
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
import { incidentStatuses, type IncidentStatus } from '../incident-types'
import { useIncident, useUpdateIncident } from '../useIncidents'

export function IncidentDetails({
  incidentId,
  canEdit,
  onClose,
}: {
  incidentId: number | null
  canEdit: boolean
  onClose: () => void
}) {
  const query = useIncident(incidentId)
  const mutation = useUpdateIncident()
  const incident = query.data

  async function updateStatus(status: IncidentStatus) {
    if (incidentId === null) return
    try {
      await mutation.mutateAsync({ incidentId, update: { status } })
    } catch {
      /* rendered below */
    }
  }

  return (
    <InvestigationDrawer
      open={incidentId !== null}
      title={incident?.title ?? `Incident ${incidentId ?? ''}`}
      eyebrow="Incident response"
      description={incident ? `INC-${incident.id}` : undefined}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading incident details" />
        </div>
      ) : query.error || !incident ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Incident details unavailable
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
                  Response summary
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {incident.description}
                </p>
              </div>
              <div className="flex gap-2">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
              <DetailItem label="Incident ID" value={incident.id} mono />
              <DetailItem label="Title" value={incident.title} />
              <DetailItem label="Severity" value={incident.severity} />
              <DetailItem
                label="Status"
                value={formatOperationLabel(incident.status)}
              />
              <DetailItem
                label="Created"
                value={
                  <time
                    dateTime={incident.created_at}
                    title={incident.created_at}
                  >
                    {formatOperationTimestamp(incident.created_at)}
                  </time>
                }
              />
              <DetailItem
                label="Last updated"
                value={
                  <time
                    dateTime={incident.updated_at}
                    title={incident.updated_at}
                  >
                    {formatOperationTimestamp(incident.updated_at)}
                  </time>
                }
              />
              {incident.closed_at !== null && (
                <DetailItem
                  label="Closed at"
                  value={
                    <time
                      dateTime={incident.closed_at}
                      title={incident.closed_at}
                    >
                      {formatOperationTimestamp(incident.closed_at)}
                    </time>
                  }
                />
              )}
            </dl>
          </section>
          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <UserRound className="size-3.5 text-violet-400" /> Ownership
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Created by user ID"
                value={incident.created_by_user_id}
                mono
              />
              <DetailItem
                label="Assigned user ID"
                value={incident.assigned_to_user_id}
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
                <ShieldCheck className="size-3.5 text-cyan-500" /> Response
                status
              </h2>
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold text-slate-300">
                  Incident status
                </span>
                <select
                  className="field"
                  value={incident.status}
                  disabled={mutation.isPending}
                  onChange={(event) =>
                    void updateStatus(event.target.value as IncidentStatus)
                  }
                >
                  {incidentStatuses.map((status) => (
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
