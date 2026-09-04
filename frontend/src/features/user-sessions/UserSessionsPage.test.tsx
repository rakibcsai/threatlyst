import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RoleRoute } from '../../app/RoleRoute'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { UserSession } from './user-sessions-api'
import { UserSessionsPage } from './UserSessionsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/admin/sessions`

const activeSession: UserSession = {
  session_id: 'session-active-1234567890',
  user_id: 2,
  username: 'demo_analyst',
  email: 'analyst@example.com',
  role: 'analyst',
  login_at: '2026-09-04T02:00:00Z',
  last_seen_at: '2026-09-04T02:10:00Z',
  logout_at: null,
  expires_at: '2026-09-04T03:00:00Z',
  ip_address: '203.0.113.10',
  country: 'Malaysia',
  region: 'Kuala Lumpur',
  city: 'Kuala Lumpur',
  location: 'Kuala Lumpur, Kuala Lumpur, Malaysia',
  browser: 'Google Chrome',
  operating_system: 'Windows',
  device_type: 'Desktop',
  user_agent: 'Mozilla/5.0 test',
  status: 'active',
  revoked: false,
}

const secondSession: UserSession = {
  ...activeSession,
  session_id: 'session-second-0987654321',
  ip_address: '198.51.100.20',
  browser: 'Safari',
  operating_system: 'iOS',
  device_type: 'Mobile',
  location: 'Petaling Jaya, Selangor, Malaysia',
}

const endedSession: UserSession = {
  ...activeSession,
  session_id: 'session-ended-1111111111',
  username: 'viewer_user',
  email: 'viewer@example.com',
  role: 'viewer',
  status: 'logged_out',
  logout_at: '2026-09-04T02:15:00Z',
}

function client() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderPage() {
  return render(
    <QueryClientProvider client={client()}>
      <UserSessionsPage />
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
        <MemoryRouter initialEntries={['/admin/sessions']}>
          <Routes>
            <Route
              path="/admin/sessions"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <UserSessionsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/forbidden"
              element={<div>Forbidden user sessions route</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('UserSessionsPage', () => {
  it('renders session metadata returned by the API', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([activeSession, endedSession]),
      ),
    )

    renderPage()

    expect(
      await screen.findByText('demo_analyst'),
    ).toBeInTheDocument()

    expect(
      screen.getAllByText('203.0.113.10'),
    ).toHaveLength(2)

    expect(
      screen.getAllByText('Google Chrome'),
    ).toHaveLength(2)

    expect(
      screen.getAllByText(/Windows/),
    ).toHaveLength(2)

    expect(
      screen.getAllByText(
        'Kuala Lumpur, Kuala Lumpur, Malaysia',
      ),
    ).toHaveLength(2)

    expect(
      screen.getByText('viewer_user'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('logged out'),
    ).toBeInTheDocument()
  })

  it('shows concurrent sessions for the same account separately', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([activeSession, secondSession]),
      ),
    )

    renderPage()

    expect(
      await screen.findAllByText('demo_analyst'),
    ).toHaveLength(2)

    expect(
      screen.getByText('203.0.113.10'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('198.51.100.20'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Google Chrome'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Safari'),
    ).toBeInTheDocument()
  })

  it('renders an empty state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([]),
      ),
    )

    renderPage()

    expect(
      await screen.findByText(
        'No user sessions yet',
      ),
    ).toBeInTheDocument()
  })

  it('renders an API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            detail:
              'Session service unavailable.',
          },
          {
            status: 503,
          },
        ),
      ),
    )

    renderPage()

    expect(
      await screen.findByText(
        'User sessions unavailable',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Session service unavailable.',
      ),
    ).toBeInTheDocument()
  })

  it('allows administrators', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([activeSession]),
      ),
    )

    renderRole('admin')

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'User Sessions',
        },
      ),
    ).toBeInTheDocument()
  })

  it.each<UserRole>(['analyst', 'viewer'])(
    'redirects %s users to forbidden',
    async (role) => {
      renderRole(role)

      expect(
        await screen.findByText(
          'Forbidden user sessions route',
        ),
      ).toBeInTheDocument()
    },
  )

  it('filters sessions by search text', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([
          activeSession,
          endedSession,
        ]),
      ),
    )

    renderPage()

    const user = userEvent.setup()

    await screen.findByText(
      'demo_analyst',
    )

    await user.type(
      screen.getByLabelText(
        'Search user sessions',
      ),
      'viewer_user',
    )

    expect(
      screen.getByText('viewer_user'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(
        'demo_analyst',
      ),
    ).not.toBeInTheDocument()
  })

  it('filters sessions by status', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([
          activeSession,
          endedSession,
        ]),
      ),
    )

    renderPage()

    const user = userEvent.setup()

    await screen.findByText(
      'demo_analyst',
    )

    await user.selectOptions(
      screen.getByLabelText(
        'Filter session status',
      ),
      'logged_out',
    )

    expect(
      screen.getByText(
        'viewer_user',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(
        'demo_analyst',
      ),
    ).not.toBeInTheDocument()
  })

  it('revokes an active session after confirmation', async () => {
    let session = activeSession
    let revokeRequests = 0

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([session]),
      ),

      http.post(
        `${endpoint}/${activeSession.session_id}/revoke`,
        () => {
          revokeRequests += 1

          session = {
            ...session,
            status: 'revoked',
            revoked: true,
          }

          return HttpResponse.json({
            message:
              'Session revoked successfully.',
            session_id:
              session.session_id,
            status: 'revoked',
          })
        },
      ),
    )

    vi.spyOn(
      window,
      'confirm',
    ).mockReturnValue(true)

    renderPage()

    const user = userEvent.setup()

    await user.click(
      await screen.findByRole(
        'button',
        {
          name: 'Revoke',
        },
      ),
    )

    expect(
      revokeRequests,
    ).toBe(1)

    expect(
      await screen.findByRole(
        'status',
      ),
    ).toHaveTextContent(
      activeSession.session_id.slice(
        0,
        8,
      ),
    )

    expect(
      await screen.findByText(
        'revoked',
      ),
    ).toBeInTheDocument()
  })

  it('does not revoke when confirmation is cancelled', async () => {
    let revokeRequests = 0

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([
          activeSession,
        ]),
      ),

      http.post(
        `${endpoint}/${activeSession.session_id}/revoke`,
        () => {
          revokeRequests += 1

          return HttpResponse.json({
            message:
              'Session revoked successfully.',
            session_id:
              activeSession.session_id,
            status: 'revoked',
          })
        },
      ),
    )

    vi.spyOn(
      window,
      'confirm',
    ).mockReturnValue(false)

    renderPage()

    const user = userEvent.setup()

    await user.click(
      await screen.findByRole(
        'button',
        {
          name: 'Revoke',
        },
      ),
    )

    expect(
      revokeRequests,
    ).toBe(0)
  })

  it('shows a failed revoke mutation', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([
          activeSession,
        ]),
      ),

      http.post(
        `${endpoint}/${activeSession.session_id}/revoke`,
        () =>
          HttpResponse.json(
            {
              detail:
                'Session revoke failed.',
            },
            {
              status: 500,
            },
          ),
      ),
    )

    vi.spyOn(
      window,
      'confirm',
    ).mockReturnValue(true)

    renderPage()

    const user = userEvent.setup()

    await user.click(
      await screen.findByRole(
        'button',
        {
          name: 'Revoke',
        },
      ),
    )

    expect(
      await screen.findByRole(
        'alert',
      ),
    ).toHaveTextContent(
      'The session could not be revoked.',
    )
  })
})