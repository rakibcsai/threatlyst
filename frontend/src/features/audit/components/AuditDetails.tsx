import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import {
  DetailItem,
  InvestigationDrawer,
} from '../../operations/components/InvestigationDrawer'
import { formatOperationTimestamp } from '../../operations/operation-utils'
import { useAuditLog } from '../useAuditLogs'
import {
  AuditActionBadge,
  AuditStatusBadge,
  ResourceBadge,
} from './AuditBadges'

export function AuditDetails({
  id,
  onClose,
}: {
  id: number | null
  onClose: () => void
}) {
  const query = useAuditLog(id)
  const log = query.data
  return (
    <InvestigationDrawer
      open={id !== null}
      title={log ? `Audit event ${log.id}` : `Audit event ${id ?? ''}`}
      eyebrow="Administrative audit trail"
      description={log?.action}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading audit log details" />
        </div>
      ) : query.error || !log ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Audit event unavailable
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
            <AuditStatusBadge status={log.status} />
            <AuditActionBadge action={log.action} />
            <ResourceBadge resource={log.resource_type} />
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {log.details ?? 'No additional details recorded.'}
          </p>
          <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <DetailItem label="Audit log ID" value={log.id} mono />
            <DetailItem
              label="Timestamp"
              value={formatOperationTimestamp(log.created_at)}
            />
            <DetailItem label="Username" value={log.username ?? 'System'} />
            <DetailItem
              label="User ID"
              value={log.user_id ?? 'Not recorded'}
              mono
            />
            <DetailItem label="Resource type" value={log.resource_type} />
            <DetailItem
              label="Resource ID"
              value={log.resource_id ?? 'Not recorded'}
              mono
            />
            <DetailItem
              label="Source IP"
              value={log.ip_address ?? 'Not recorded'}
              mono
            />
            <DetailItem label="Result" value={log.status} />
          </dl>
        </section>
      )}
    </InvestigationDrawer>
  )
}
