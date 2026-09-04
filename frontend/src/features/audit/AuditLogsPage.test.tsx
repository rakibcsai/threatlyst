import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RoleRoute } from '../../app/RoleRoute'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { AuditLogResponse } from './audit-types'
import { AuditLogsPage } from './AuditLogsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/audit-logs`
const fixture: AuditLogResponse = {
  id: 41,
  user_id: 7,
  username: 'security.admin',
  action: 'api_key_created',
  resource_type: 'api_key',
  resource_id: '12',
  status: 'success',
  details: "Created API key 'SIEM ingestion'.",
  ip_address: '203.0.113.24',
  created_at: '2026-09-01T10:15:00Z',
}

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPage() {
  return render(
    <QueryClientProvider client={client()}>
      <AuditLogsPage />
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
    logout: async () => undefined,
  }
  return render(
    <QueryClientProvider client={client()}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/audit']}>
          <Routes>
            <Route
              path="/audit"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/forbidden"
              element={<div>Forbidden audit route</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('AuditLogsPage', () => {
  it('renders audit records returned by the API', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([fixture])))
    renderPage()
    expect(
      (await screen.findAllByText('security.admin')).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('api_key_created').length).toBeGreaterThan(0)
    expect(screen.getAllByText('203.0.113.24').length).toBeGreaterThan(0)
  })

  it('renders an empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderPage()
    expect(await screen.findByText('No audit logs yet')).toBeInTheDocument()
  })

  it('renders an API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Audit service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('Audit logs unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('Audit service unavailable.')).toBeInTheDocument()
  })

  it('retries a failed list request', async () => {
    let requests = 0
    server.use(
      http.get(endpoint, () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json({ detail: 'Temporary failure.' }, { status: 503 })
          : HttpResponse.json([fixture])
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(
      (await screen.findAllByText('security.admin')).length,
    ).toBeGreaterThan(0)
  })

  it('allows administrators', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([fixture])))
    renderRole('admin')
    expect(
      await screen.findByRole('heading', { name: 'Audit Logs' }),
    ).toBeInTheDocument()
  })

  it.each<UserRole>(['analyst', 'viewer'])(
    'redirects %s users to forbidden',
    async (role) => {
      renderRole(role)
      expect(
        await screen.findByText('Forbidden audit route'),
      ).toBeInTheDocument()
    },
  )

  it('filters the returned audit dataset client-side', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([fixture])))
    renderPage()
    const user = userEvent.setup()
    await screen.findAllByText('security.admin')
    await user.type(screen.getByLabelText('Search audit logs'), 'not present')
    expect(screen.getByText('No matching audit logs')).toBeInTheDocument()
  })

  it('opens a detail view with returned metadata', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([fixture])),
      http.get(`${endpoint}/41`, () => HttpResponse.json(fixture)),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (await screen.findAllByRole('button', { name: 'Open audit log 41' }))[0],
    )
    const dialog = await screen.findByRole('dialog', { name: 'Audit event 41' })
    expect(dialog).toHaveTextContent("Created API key 'SIEM ingestion'.")
    expect(dialog).toHaveTextContent('security.admin')
    expect(dialog).toHaveTextContent('203.0.113.24')
  })

  it('keeps the audit trail read-only', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([fixture])))
    renderPage()
    await screen.findAllByText('security.admin')
    expect(
      screen.queryByRole('button', { name: /edit|delete|clear logs|export/i }),
    ).not.toBeInTheDocument()
  })
})
