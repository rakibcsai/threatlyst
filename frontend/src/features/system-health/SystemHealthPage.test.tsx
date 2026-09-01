import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RoleRoute } from '../../app/RoleRoute'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { OperationalMetrics } from './system-health-types'
import { SystemHealthPage } from './SystemHealthPage'

const metricsEndpoint = `${env.VITE_API_BASE_URL}/api/metrics`
const healthEndpoint = `${env.VITE_API_BASE_URL}/health`
const liveEndpoint = `${env.VITE_API_BASE_URL}/live`

const metricsFixture: OperationalMetrics = {
  total_requests: 1250,
  total_errors: 25,
  average_duration_ms: 18.42,
  status_counts: { '200': 1180, '404': 45, '500': 25 },
  path_counts: { '/api/events': 610, '/api/alerts': 390, '/health': 250 },
}

function useHealthyHandlers(metrics = metricsFixture) {
  server.use(
    http.get(healthEndpoint, () =>
      HttpResponse.json({
        status: 'healthy',
        service: 'ThreatLyst API',
        database: 'healthy',
      }),
    ),
    http.get(liveEndpoint, () =>
      HttpResponse.json({ status: 'alive', service: 'ThreatLyst API' }),
    ),
    http.get(metricsEndpoint, () => HttpResponse.json(metrics)),
  )
}

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPage() {
  return render(
    <QueryClientProvider client={client()}>
      <SystemHealthPage />
    </QueryClientProvider>,
  )
}

function renderRole(role: UserRole) {
  const auth: AuthContextValue = {
    user: {
      id: 1,
      email: `${role}@example.com`,
      username: role,
      role,
      is_active: true,
    },
    isAuthenticated: true,
    isLoading: false,
    login: async () => undefined,
    logout: () => undefined,
  }
  return render(
    <QueryClientProvider client={client()}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/system-health']}>
          <Routes>
            <Route
              path="/system-health"
              element={
                <RoleRoute allowedRoles={['admin', 'analyst', 'viewer']}>
                  <SystemHealthPage />
                </RoleRoute>
              }
            />
            <Route
              path="/forbidden"
              element={<div>Forbidden health route</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('SystemHealthPage', () => {
  it('renders healthy readiness and database status', async () => {
    useHealthyHandlers()
    renderPage()
    expect(
      await screen.findByRole('heading', { name: 'System Health' }),
    ).toBeInTheDocument()
    const status = screen.getByRole('region', { name: 'Service status' })
    expect(status).toHaveTextContent('API readinessHealthy')
    expect(status).toHaveTextContent('Database readinessHealthy')
    expect(screen.getByText(/ThreatLyst API/)).toBeInTheDocument()
  })

  it('treats an HTTP 503 health response as degraded data', async () => {
    useHealthyHandlers()
    server.use(
      http.get(healthEndpoint, () =>
        HttpResponse.json(
          {
            status: 'unhealthy',
            service: 'ThreatLyst API',
            database: 'unhealthy',
          },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    const status = await screen.findByRole('region', { name: 'Service status' })
    expect(status).toHaveTextContent('API readinessDegraded')
    expect(status).toHaveTextContent('Database readinessDegraded')
    expect(status).not.toHaveTextContent('Unreachable')
  })

  it('renders successful process liveness independently', async () => {
    useHealthyHandlers()
    renderPage()
    const status = await screen.findByRole('region', { name: 'Service status' })
    expect(status).toHaveTextContent('Process livenessHealthy')
    expect(status).toHaveTextContent('external dependencies are not checked')
  })

  it('renders the exact operational metrics and derived error rate', async () => {
    useHealthyHandlers()
    renderPage()
    const metrics = await screen.findByRole('region', {
      name: 'Operational metrics',
    })
    expect(metrics).toHaveTextContent('1,250')
    expect(metrics).toHaveTextContent('25')
    expect(metrics).toHaveTextContent('18.42 ms')
    expect(metrics).toHaveTextContent('2%')
    expect(metrics).toHaveTextContent('errors ÷ requests')
  })

  it('handles a zero-request error rate without division errors', async () => {
    useHealthyHandlers({
      total_requests: 0,
      total_errors: 0,
      average_duration_ms: 0,
      status_counts: {},
      path_counts: {},
    })
    renderPage()
    const metrics = await screen.findByRole('region', {
      name: 'Operational metrics',
    })
    expect(metrics).toHaveTextContent('Current error rate0%')
    expect(metrics).not.toHaveTextContent('NaN')
    expect(metrics).not.toHaveTextContent('Infinity')
  })

  it('renders status counts in an accessible chart label', async () => {
    useHealthyHandlers()
    renderPage()
    expect(
      await screen.findByRole('img', {
        name: 'HTTP status distribution: 200 1180, 404 45, 500 25',
      }),
    ).toBeInTheDocument()
  })

  it('ranks API path activity by request count', async () => {
    useHealthyHandlers()
    renderPage()
    await screen.findByText('/api/events')
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('/api/events')
    expect(rows[1]).toHaveTextContent('610')
    expect(rows[2]).toHaveTextContent('/api/alerts')
    expect(rows[3]).toHaveTextContent('/health')
  })

  it('keeps service status visible when the metrics API fails', async () => {
    useHealthyHandlers()
    server.use(
      http.get(metricsEndpoint, () =>
        HttpResponse.json(
          { detail: 'Metrics temporarily unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('Operational metrics unavailable'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Metrics temporarily unavailable.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Service status' }),
    ).toHaveTextContent('Healthy')
  })

  it('retries a failed metrics request', async () => {
    let requests = 0
    useHealthyHandlers()
    server.use(
      http.get(metricsEndpoint, () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json(
              { detail: 'Temporary metrics failure.' },
              { status: 503 },
            )
          : HttpResponse.json(metricsFixture)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(
      await screen.findByRole('region', { name: 'Operational metrics' }),
    ).toHaveTextContent('1,250')
  })

  it('renders metrics while readiness is unreachable', async () => {
    useHealthyHandlers()
    server.use(http.get(healthEndpoint, () => HttpResponse.error()))
    renderPage()
    expect(
      await screen.findByRole('region', { name: 'Operational metrics' }),
    ).toHaveTextContent('1,250')
    const status = screen.getByRole('region', { name: 'Service status' })
    expect(status).toHaveTextContent('API readinessUnreachable')
    expect(status).toHaveTextContent('Database readinessUnreachable')
    expect(status).toHaveTextContent('Process livenessHealthy')
  })

  it('manually refreshes readiness, liveness, and metrics', async () => {
    const requests = { health: 0, live: 0, metrics: 0 }
    server.use(
      http.get(healthEndpoint, () => {
        requests.health += 1
        return HttpResponse.json({
          status: 'healthy',
          service: 'ThreatLyst API',
          database: 'healthy',
        })
      }),
      http.get(liveEndpoint, () => {
        requests.live += 1
        return HttpResponse.json({ status: 'alive', service: 'ThreatLyst API' })
      }),
      http.get(metricsEndpoint, () => {
        requests.metrics += 1
        return HttpResponse.json(metricsFixture)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await screen.findByRole('region', { name: 'Operational metrics' })
    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    await waitFor(() =>
      expect(requests).toEqual({ health: 2, live: 2, metrics: 2 }),
    )
  })

  it.each<UserRole>(['admin', 'analyst', 'viewer'])(
    'allows the %s role',
    async (role) => {
      useHealthyHandlers()
      renderRole(role)
      expect(
        await screen.findByRole('heading', { name: 'System Health' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Forbidden health route'),
      ).not.toBeInTheDocument()
    },
  )

  it('states the process scope and exposes no fabricated operational controls', async () => {
    useHealthyHandlers()
    renderPage()
    expect(
      await screen.findByText(
        /in-memory counters for the current backend process/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/reset whenever that process restarts/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /stream|auto-refresh|export/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: /CPU|memory|disk|SLA|historical trend|requests per second/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('shows one loading state while all system queries are pending', () => {
    server.use(
      http.get(healthEndpoint, async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
      http.get(liveEndpoint, async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
      http.get(metricsEndpoint, async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    renderPage()
    expect(screen.getByLabelText('Loading system health')).toBeInTheDocument()
  })
})
