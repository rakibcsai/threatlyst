import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/api-error'
import { SeverityBadge } from '../../events/components/SeverityBadge'
import {
  DetailItem,
  InvestigationDrawer,
} from '../../operations/components/InvestigationDrawer'
import { formatOperationLabel } from '../../operations/operation-utils'
import {
  threatSeverities,
  type ThreatIndicatorResponse,
  type ThreatSeverity,
} from '../indicator-types'
import { useIndicator, useUpdateIndicator } from '../useIndicators'
import {
  ActiveBadge,
  ConfidenceBadge,
  IndicatorTypeBadge,
} from './IndicatorBadges'

export function IndicatorDetails({
  id,
  canEdit,
  onClose,
}: {
  id: number | null
  canEdit: boolean
  onClose: () => void
}) {
  const query = useIndicator(id)
  const item = query.data
  return (
    <InvestigationDrawer
      open={id !== null}
      title={item?.indicator_value ?? `Indicator ${id ?? ''}`}
      eyebrow="Threat intelligence"
      description={item ? `IOC-${item.id}` : undefined}
      onClose={onClose}
    >
      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Spinner label="Loading indicator details" />
        </div>
      ) : query.error || !item ? (
        <div className="surface-card p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-rose-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">
            Indicator details unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {getApiErrorMessage(query.error)}
          </p>
          <Button className="mt-5" onClick={() => void query.refetch()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <section className="surface-card p-5">
            <div className="flex flex-wrap gap-2">
              <IndicatorTypeBadge type={item.indicator_type} />
              <SeverityBadge severity={item.severity} />
              <ConfidenceBadge value={item.confidence} />
              <ActiveBadge active={item.is_active} />
            </div>
            <p className="mt-4 break-all font-mono text-sm text-white">
              {item.indicator_value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {item.description ?? 'No description recorded.'}
            </p>
            <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
              <DetailItem label="Database ID" value={item.id} mono />
              <DetailItem
                label="Indicator type"
                value={formatOperationLabel(item.indicator_type)}
              />
              <DetailItem label="Threat type" value={item.threat_type} />
              <DetailItem label="Source" value={item.source} />
              <DetailItem label="Confidence" value={`${item.confidence}%`} />
              <DetailItem
                label="Active state"
                value={item.is_active ? 'Active' : 'Inactive'}
              />
            </dl>
          </section>
          {canEdit && <IndicatorEditor key={item.id} item={item} />}
        </>
      )}
    </InvestigationDrawer>
  )
}

function IndicatorEditor({ item }: { item: ThreatIndicatorResponse }) {
  const mutation = useUpdateIndicator()
  const [threatType, setThreatType] = useState(item.threat_type ?? '')
  const [confidence, setConfidence] = useState(item.confidence)
  const [severity, setSeverity] = useState<ThreatSeverity>(item.severity)
  const [description, setDescription] = useState(item.description ?? '')
  const [active, setActive] = useState(item.is_active)

  async function save() {
    try {
      await mutation.mutateAsync({
        id: item.id,
        update: {
          threat_type: threatType,
          confidence,
          severity,
          description,
          is_active: active,
        },
      })
    } catch {
      /* rendered */
    }
  }

  return (
    <section className="surface-card p-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        Update intelligence metadata
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Threat type
          </span>
          <input
            className="field"
            value={threatType}
            onChange={(e) => setThreatType(e.target.value)}
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Confidence
          </span>
          <input
            aria-label="Confidence"
            className="field"
            type="number"
            min="0"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Severity
          </span>
          <select
            aria-label="Severity"
            className="field"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as ThreatSeverity)}
          >
            {threatSeverities.map((value) => (
              <option key={value} value={value}>
                {formatOperationLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 self-end rounded-lg border border-slate-800 p-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active indicator
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold text-slate-300">
          Description
        </span>
        <textarea
          className="field min-h-28 py-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {mutation.error && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      <Button
        className="mt-4"
        onClick={() => void save()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </section>
  )
}
