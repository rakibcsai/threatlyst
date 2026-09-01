import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RoleRoute } from '../../app/RoleRoute'
import { env } from '../../config/env'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { UserRole } from '../../types/auth'
import { server } from '../../test/server'
import type { SecurityReportResponse } from './report-types'
import { ReportsPage } from './ReportsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/reports/security-summary`
const fixture: SecurityReportResponse = {
  report: {
    report_title: 'ThreatLyst Security Report',
    generated_at: '2026-08-31T12:00:00Z',
    generated_by_user_id: 7,
    generated_by_username: 'soc.analyst',
    dashboard: {
      total_events: 1284,
      verdicts: { benign: 1062, suspicious: 222 },
      anomalies: 37,
      risk_levels: { critical: 14, high: 83, medium: 317, low: 870 },
      event_types: { failed_login: 458, process_execution: 322 },
      attack_categories: { credential_access: 78, execution: 49 },
      mitre_techniques: { T1110: 71, 'T1059.001': 46 },
    },
  },
}

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}
function renderPage() {
  return render(
    <QueryClientProvider client={client()}>
      <ReportsPage />
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
        <MemoryRouter initialEntries={['/reports']}>
          <Routes>
            <Route
              path="/reports"
              element={
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <ReportsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/forbidden"
              element={<div>Forbidden report route</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ReportsPage', () => {
  it('renders the security summary returned by the API', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(fixture)))
    renderPage()
    expect(
      await screen.findByRole('heading', {
        name: 'ThreatLyst Security Report',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('soc.analyst')).toBeInTheDocument()
    expect(screen.getByText('1,284')).toBeInTheDocument()
    expect(screen.getByText('Failed Login')).toBeInTheDocument()
    expect(screen.getByText('T1110')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    server.use(
      http.get(endpoint, async () => {
        await delay('infinite')
        return HttpResponse.json(fixture)
      }),
    )
    renderPage()
    expect(screen.getByLabelText('Loading security report')).toBeInTheDocument()
  })

  it('shows the report error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Report generation failed.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('Security report unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('Report generation failed.')).toBeInTheDocument()
  })

  it('retries report generation', async () => {
    let requests = 0
    server.use(
      http.get(endpoint, () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json(
              { detail: 'Temporary report failure.' },
              { status: 503 },
            )
          : HttpResponse.json(fixture)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('soc.analyst')).toBeInTheDocument()
  })

  it.each<UserRole>(['admin', 'analyst'])(
    'allows the %s role',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json(fixture)))
      renderRole(role)
      expect(
        await screen.findByRole('heading', {
          name: 'ThreatLyst Security Report',
        }),
      ).toBeInTheDocument()
    },
  )

  it('redirects viewers to forbidden', async () => {
    renderRole('viewer')
    expect(
      await screen.findByText('Forbidden report route'),
    ).toBeInTheDocument()
  })

  it('labels charts with exact API values', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(fixture)))
    renderPage()
    await screen.findByText('soc.analyst')
    expect(
      screen.getByRole('img', {
        name: 'Risk distribution: Critical 14, High 83, Medium 317, Low 870',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'AI verdicts: 222 suspicious and 1062 benign',
      }),
    ).toBeInTheDocument()
  })

  it('does not expose unsupported report controls', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(fixture)))
    renderPage()
    await screen.findByText('soc.analyst')
    expect(
      screen.queryByRole('button', { name: /export|schedule|email/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/date range|start date|end date/i),
    ).not.toBeInTheDocument()
  })
})
