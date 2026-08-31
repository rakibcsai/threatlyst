import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/server'
import type { DashboardStats } from './dashboard-types'
import { DashboardPage } from './DashboardPage'

const endpoint = 'http://127.0.0.1:8000/api/dashboard/stats'

const stats: DashboardStats = {
  total_events: 1284,
  verdicts: { benign: 1062, suspicious: 222 },
  anomalies: 37,
  risk_levels: { critical: 14, high: 83, medium: 317, low: 870 },
  event_types: { failed_login: 458, process_execution: 322 },
  attack_categories: { credential_access: 78, execution: 49 },
  mitre_techniques: { T1110: 71, 'T1059.001': 46 },
}

function renderDashboard(children: ReactNode = <DashboardPage />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  it('renders dashboard statistics returned by the API', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(stats)))
    renderDashboard()

    expect(
      await screen.findByRole('heading', { name: 'SOC Dashboard' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1,284')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('83')).toBeInTheDocument()
    expect(screen.getByText('37')).toBeInTheDocument()
    expect(screen.getByText('Failed Login')).toBeInTheDocument()
    expect(screen.getByText('T1110')).toBeInTheDocument()
  })

  it('shows a loading state while dashboard data is pending', () => {
    server.use(
      http.get(endpoint, async () => {
        await delay('infinite')
        return HttpResponse.json(stats)
      }),
    )
    renderDashboard()
    expect(screen.getByLabelText('Loading SOC dashboard')).toBeInTheDocument()
  })

  it('shows an API error state with a retry action', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Dashboard service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderDashboard()

    expect(await screen.findByText('Dashboard unavailable')).toBeInTheDocument()
    expect(
      screen.getByText('Dashboard service unavailable.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when no events exist', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...stats,
          total_events: 0,
          verdicts: { benign: 0, suspicious: 0 },
          anomalies: 0,
          risk_levels: { critical: 0, high: 0, medium: 0, low: 0 },
          event_types: {},
          attack_categories: {},
          mitre_techniques: {},
        }),
      ),
    )
    renderDashboard()
    expect(
      await screen.findByText('Awaiting security telemetry'),
    ).toBeInTheDocument()
  })
})
