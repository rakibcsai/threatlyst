import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import type { AlertResponse, AlertStatus } from './alert-types'
import { AlertsPage } from './AlertsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/alerts`
const alertFixture: AlertResponse = {
  id: 7,
  event_id: 'evt-4031',
  title: 'Suspicious authentication burst',
  severity: 'high',
  status: 'open',
  description: 'Multiple authentication failures originated from one source.',
  assigned_to_user_id: 4,
  created_at: '2026-08-30T09:15:00Z',
  updated_at: '2026-08-31T11:45:00Z',
}

function renderAlerts(role: UserRole = 'analyst') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
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
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <AlertsPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

function useAlertHandlers(alert: AlertResponse = alertFixture) {
  server.use(
    http.get(endpoint, () => HttpResponse.json([alert])),
    http.get(`${endpoint}/${alert.id}`, () => HttpResponse.json(alert)),
  )
}

async function openAlert() {
  const user = userEvent.setup()
  await user.click(
    (await screen.findAllByRole('button', { name: 'Open alert 7' }))[0],
  )
  return user
}

describe('AlertsPage', () => {
  it('renders the alert list', async () => {
    useAlertHandlers()
    const { container } = renderAlerts()
    expect(
      (await screen.findAllByText(alertFixture.title)).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('evt-4031').length).toBeGreaterThan(0)
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      alertFixture.created_at,
    )
  })
  it('renders the empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderAlerts()
    expect(await screen.findByText('No alerts yet')).toBeInTheDocument()
  })
  it('renders the API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Alert service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderAlerts()
    expect(await screen.findByText('Alerts unavailable')).toBeInTheDocument()
    expect(screen.getByText('Alert service unavailable.')).toBeInTheDocument()
  })
  it('opens detail data from the alert detail endpoint', async () => {
    useAlertHandlers()
    renderAlerts()
    await openAlert()
    const dialog = screen.getByRole('dialog', { name: alertFixture.title })
    expect(dialog).toHaveTextContent('ALT-7')
    expect(dialog).toHaveTextContent('evt-4031')
    expect(dialog).toHaveTextContent('Multiple authentication failures')
    expect(dialog).toHaveTextContent('Assigned user ID')
    expect(dialog).toHaveTextContent('4')
    expect(dialog).toHaveTextContent('Created')
    expect(dialog).toHaveTextContent('Last updated')
  })
  it.each<UserRole>(['admin', 'analyst'])(
    'allows %s creation access',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json([])))
      renderAlerts(role)
      expect(
        await screen.findByRole('button', { name: 'Create alert' }),
      ).toBeInTheDocument()
    },
  )
  it('keeps viewers read-only', async () => {
    useAlertHandlers()
    renderAlerts('viewer')
    expect(await screen.findByText('Read-only access')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Create alert' }),
    ).not.toBeInTheDocument()
    await openAlert()
    expect(screen.queryByLabelText('Alert status')).not.toBeInTheDocument()
  })
  it('creates an alert with the exact request fields', async () => {
    let body: unknown
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(alertFixture)
      }),
    )
    renderAlerts()
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'Create alert' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Create alert' })
    await user.type(within(dialog).getByLabelText('Event ID'), 'evt-4031')
    await user.type(within(dialog).getByLabelText('Title'), alertFixture.title)
    await user.selectOptions(within(dialog).getByLabelText('Severity'), 'high')
    await user.type(
      within(dialog).getByLabelText('Description'),
      alertFixture.description,
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Create alert' }),
    )
    expect(await screen.findByText('No alerts yet')).toBeInTheDocument()
    expect(body).toEqual({
      event_id: 'evt-4031',
      title: alertFixture.title,
      severity: 'high',
      description: alertFixture.description,
    })
  })
  it('updates alert status', async () => {
    let status: AlertStatus = 'open'
    let patchBody: unknown
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([{ ...alertFixture, status }]),
      ),
      http.get(`${endpoint}/7`, () =>
        HttpResponse.json({ ...alertFixture, status }),
      ),
      http.patch(`${endpoint}/7`, async ({ request }) => {
        patchBody = await request.json()
        status = 'investigating'
        return HttpResponse.json({ ...alertFixture, status })
      }),
    )
    renderAlerts()
    const user = await openAlert()
    await user.selectOptions(
      screen.getByLabelText('Alert status'),
      'investigating',
    )
    expect(patchBody).toEqual({ status: 'investigating' })
    expect(await screen.findByRole('dialog')).toHaveTextContent('Investigating')
  })
  it('shows a failed alert mutation', async () => {
    useAlertHandlers()
    server.use(
      http.patch(`${endpoint}/7`, () =>
        HttpResponse.json({ detail: 'Alert update failed.' }, { status: 500 }),
      ),
    )
    renderAlerts()
    const user = await openAlert()
    await user.selectOptions(screen.getByLabelText('Alert status'), 'closed')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Alert update failed.',
    )
  })
})
