import {
  Activity,
  BrainCircuit,
  RefreshCw,
  ShieldAlert,
  Siren,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { DashboardCard } from './components/DashboardCard'
import { DashboardEmpty } from './components/DashboardEmpty'
import { DashboardError } from './components/DashboardError'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { RankedMetricList } from './components/RankedMetricList'
import { RiskDistributionChart } from './components/RiskDistributionChart'
import { StatCard } from './components/StatCard'
import { VerdictDonutChart } from './components/VerdictDonutChart'
import { toMetricData } from './dashboard-utils'
import { useDashboardStats } from './useDashboardStats'

export function DashboardPage() {
  const { data, error, isLoading, isFetching, refetch, dataUpdatedAt } =
    useDashboardStats()

  if (isLoading) return <DashboardSkeleton />
  if (error || !data)
    return (
      <DashboardError
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )

  const updated = dataUpdatedAt
    ? new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(dataUpdatedAt)
    : null

  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <Activity className="size-3.5" />
              Live operational overview
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white md:text-3xl">
              SOC Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              AI-assisted risk posture and security-event intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">
              {updated ? `Updated ${updated}` : 'Current snapshot'}
            </span>
            <Button
              variant="secondary"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {data.total_events === 0 ? (
          <DashboardEmpty />
        ) : (
          <>
            <section
              className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Security overview metrics"
            >
              <StatCard
                label="Total security events"
                value={data.total_events}
                detail="Events analyzed by ThreatLyst"
                icon={Siren}
                tone="cyan"
              />
              <StatCard
                label="Critical risk"
                value={data.risk_levels.critical}
                detail="Events requiring immediate attention"
                icon={ShieldAlert}
                tone="rose"
              />
              <StatCard
                label="High risk"
                value={data.risk_levels.high}
                detail="Elevated security activity"
                icon={TriangleAlert}
                tone="orange"
              />
              <StatCard
                label="AI anomalies"
                value={data.anomalies}
                detail="Anomalous events identified"
                icon={BrainCircuit}
                tone="violet"
              />
            </section>
            <section className="mt-4 grid gap-4 xl:grid-cols-5">
              <DashboardCard
                title="Risk level distribution"
                description="Rule-analysis classification across security events"
                className="xl:col-span-3"
              >
                <RiskDistributionChart riskLevels={data.risk_levels} />
              </DashboardCard>
              <DashboardCard
                title="AI verdict distribution"
                description="Benign and suspicious AI classifications"
                className="xl:col-span-2"
              >
                <VerdictDonutChart verdicts={data.verdicts} />
              </DashboardCard>
            </section>
            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <DashboardCard
                title="Event categories"
                description="Most frequently observed event types"
              >
                <RankedMetricList
                  data={toMetricData(data.event_types)}
                  emptyLabel="No event category data available"
                />
              </DashboardCard>
              <DashboardCard
                title="Attack categories"
                description="AI-classified attack activity"
              >
                <RankedMetricList
                  data={toMetricData(data.attack_categories)}
                  emptyLabel="No attack category data available"
                />
              </DashboardCard>
              <DashboardCard
                title="MITRE ATT&CK activity"
                description="Techniques mapped during AI analysis"
              >
                <RankedMetricList
                  data={toMetricData(data.mitre_techniques)}
                  emptyLabel="No MITRE technique mappings available"
                  preserveLabels
                />
              </DashboardCard>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
