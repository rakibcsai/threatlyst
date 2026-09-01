import {
  Activity,
  AlertTriangle,
  Clock3,
  Database,
  Info,
  RefreshCw,
  ServerCog,
  ServerCrash,
  Sigma,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { getApiErrorMessage } from '../../lib/api-error'
import { DashboardCard } from '../dashboard/components/DashboardCard'
import { DashboardSkeleton } from '../dashboard/components/DashboardSkeleton'
import { formatCount } from '../dashboard/dashboard-utils'
import { OperationalKpiCard } from './components/OperationalKpiCard'
import { PathActivityTable } from './components/PathActivityTable'
import { ServiceStatusCard } from './components/ServiceStatusCard'
import { StatusDistributionChart } from './components/StatusDistributionChart'
import {
  useLiveness,
  useOperationalMetrics,
  useReadiness,
} from './useSystemHealth'

export function SystemHealthPage() {
  const readiness = useReadiness()
  const liveness = useLiveness()
  const metrics = useOperationalMetrics()
  const isRefreshing =
    readiness.isFetching || liveness.isFetching || metrics.isFetching

  async function refresh() {
    await Promise.all([
      readiness.refetch(),
      liveness.refetch(),
      metrics.refetch(),
    ])
  }

  if (readiness.isLoading && liveness.isLoading && metrics.isLoading)
    return (
      <div aria-label="Loading system health">
        <DashboardSkeleton />
      </div>
    )

  const readinessState = readiness.error
    ? 'unreachable'
    : readiness.data?.status === 'healthy'
      ? 'healthy'
      : readiness.data
        ? 'unhealthy'
        : 'loading'
  const databaseState = readiness.error
    ? 'unreachable'
    : readiness.data?.database === 'healthy'
      ? 'healthy'
      : readiness.data
        ? 'unhealthy'
        : 'loading'
  const livenessState = liveness.error
    ? 'unreachable'
    : liveness.data?.status === 'alive'
      ? 'healthy'
      : 'loading'
  const serviceName =
    readiness.data?.service ?? liveness.data?.service ?? 'ThreatLyst API'

  return (
    <main className="p-5 md:p-7 xl:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <ServerCog className="size-3.5" /> Operational visibility
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white md:text-3xl">
              System Health
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Live readiness and current-process activity for {serviceName}.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => void refresh()}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        <section
          className="mt-6 grid gap-4 md:grid-cols-3"
          aria-label="Service status"
        >
          <ServiceStatusCard
            title="API readiness"
            state={readinessState}
            detail={
              readiness.error
                ? getApiErrorMessage(readiness.error)
                : 'Application and dependency readiness probe.'
            }
            icon={ServerCog}
          />
          <ServiceStatusCard
            title="Database readiness"
            state={databaseState}
            detail={
              readiness.error
                ? 'Readiness probe could not be reached.'
                : 'Database connectivity reported by the API.'
            }
            icon={Database}
          />
          <ServiceStatusCard
            title="Process liveness"
            state={livenessState}
            detail={
              liveness.error
                ? getApiErrorMessage(liveness.error)
                : 'Process-only liveness; external dependencies are not checked.'
            }
            icon={Activity}
          />
        </section>

        {metrics.isLoading ? (
          <section
            className="surface-card mt-4 h-72 animate-pulse bg-slate-900/50"
            aria-label="Loading operational metrics"
          />
        ) : metrics.error || !metrics.data ? (
          <section
            className="surface-card mt-4 p-6 text-center"
            aria-label="Metrics unavailable"
          >
            <AlertTriangle className="mx-auto size-8 text-rose-400" />
            <h2 className="mt-3 text-base font-semibold text-white">
              Operational metrics unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {getApiErrorMessage(metrics.error)}
            </p>
            <Button
              className="mt-5"
              variant="secondary"
              onClick={() => void metrics.refetch()}
              disabled={metrics.isFetching}
            >
              <RefreshCw
                className={`size-4 ${metrics.isFetching ? 'animate-spin' : ''}`}
              />
              {metrics.isFetching ? 'Retrying' : 'Try again'}
            </Button>
          </section>
        ) : (
          <>
            <section
              className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Operational metrics"
            >
              <OperationalKpiCard
                label="Total requests"
                value={formatCount(metrics.data.total_requests)}
                detail="Requests recorded by this API process"
                icon={Sigma}
              />
              <OperationalKpiCard
                label="Total errors"
                value={formatCount(metrics.data.total_errors)}
                detail="HTTP 5xx responses in this process"
                icon={ServerCrash}
              />
              <OperationalKpiCard
                label="Average duration"
                value={`${metrics.data.average_duration_ms.toLocaleString('en-US', { maximumFractionDigits: 2 })} ms`}
                detail="Mean duration across recorded requests"
                icon={Clock3}
              />
              <OperationalKpiCard
                label="Current error rate"
                value={`${(metrics.data.total_requests === 0 ? 0 : (metrics.data.total_errors / metrics.data.total_requests) * 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`}
                detail="Derived from current-process errors ÷ requests"
                icon={AlertTriangle}
              />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-5">
              <DashboardCard
                title="HTTP status distribution"
                description="Response counts recorded by this process"
                className="xl:col-span-2"
              >
                <StatusDistributionChart
                  statusCounts={metrics.data.status_counts}
                />
              </DashboardCard>
              <DashboardCard
                title="API path activity"
                description="Ranked by current-process request count"
                className="xl:col-span-3"
              >
                <PathActivityTable pathCounts={metrics.data.path_counts} />
              </DashboardCard>
            </section>
          </>
        )}

        <aside className="mt-4 flex gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-xs leading-5 text-slate-400">
          <Info
            className="mt-0.5 size-4 shrink-0 text-cyan-400"
            aria-hidden="true"
          />
          <p>
            These metrics are in-memory counters for the current backend process
            and reset whenever that process restarts. They are not historical
            telemetry, uptime reporting, or SLA data.
          </p>
        </aside>
      </div>
    </main>
  )
}
