import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import type { IncidentResponse, IncidentStatus } from './incident-types'
import { IncidentsPage } from './IncidentsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/incidents`
const incidentFixture: IncidentResponse = {
  id: 12,
  title: 'Compromised workstation response',
  description:
    'Endpoint activity requires containment and credential rotation.',
  severity: 'critical',
  status: 'open',
  assigned_to_user_id: null,
  created_by_user_id: 3,
  created_at: '2026-08-30T09:15:00Z',
  updated_at: '2026-08-31T11:45:00Z',
  closed_at: null,
}

function renderIncidents(role: UserRole = 'analyst') {
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
    logout: async () => undefined,
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <IncidentsPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

function useIncidentHandlers(incident: IncidentResponse = incidentFixture) {
  server.use(
    http.get(endpoint, () => HttpResponse.json([incident])),
    http.get(`${endpoint}/${incident.id}`, () => HttpResponse.json(incident)),
  )
}
async function openIncident() {
  const user = userEvent.setup()
  await user.click(
    (await screen.findAllByRole('button', { name: 'Open incident 12' }))[0],
  )
  return user
}

describe('IncidentsPage', () => {
  it('renders the incident list', async () => {
    useIncidentHandlers()
    const { container } = renderIncidents()
    expect(
      (await screen.findAllByText(incidentFixture.title)).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('INC-12').length).toBeGreaterThan(0)
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      incidentFixture.created_at,
    )
  })
  it('renders the empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderIncidents()
    expect(await screen.findByText('No incidents yet')).toBeInTheDocument()
  })
  it('renders the API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Incident service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderIncidents()
    expect(await screen.findByText('Incidents unavailable')).toBeInTheDocument()
    expect(
      screen.getByText('Incident service unavailable.'),
    ).toBeInTheDocument()
  })
  it('opens detail data from the incident detail endpoint', async () => {
    useIncidentHandlers()
    renderIncidents()
    await openIncident()
    const dialog = screen.getByRole('dialog', { name: incidentFixture.title })
    expect(dialog).toHaveTextContent('INC-12')
    expect(dialog).toHaveTextContent('requires containment')
    expect(dialog).toHaveTextContent('Created by user ID')
    expect(dialog).toHaveTextContent('3')
    expect(dialog).toHaveTextContent('Created')
    expect(dialog).toHaveTextContent('Last updated')
    expect(dialog).not.toHaveTextContent('Closed at')
  })
  it.each<UserRole>(['admin', 'analyst'])(
    'allows %s creation access',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json([])))
      renderIncidents(role)
      expect(
        await screen.findByRole('button', { name: 'Create incident' }),
      ).toBeInTheDocument()
    },
  )
  it('keeps viewers read-only', async () => {
    useIncidentHandlers()
    renderIncidents('viewer')
    expect(await screen.findByText('Read-only access')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Create incident' }),
    ).not.toBeInTheDocument()
    await openIncident()
    expect(screen.queryByLabelText('Incident status')).not.toBeInTheDocument()
  })
  it('creates an incident with the exact request fields', async () => {
    let body: unknown
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(incidentFixture)
      }),
    )
    renderIncidents()
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'Create incident' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Create incident' })
    await user.type(
      within(dialog).getByLabelText('Title'),
      incidentFixture.title,
    )
    await user.selectOptions(
      within(dialog).getByLabelText('Severity'),
      'critical',
    )
    await user.type(
      within(dialog).getByLabelText('Description'),
      incidentFixture.description,
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Create incident' }),
    )
    expect(await screen.findByText('No incidents yet')).toBeInTheDocument()
    expect(body).toEqual({
      title: incidentFixture.title,
      description: incidentFixture.description,
      severity: 'critical',
    })
  })
  it('updates incident status', async () => {
    let status: IncidentStatus = 'open'
    let patchBody: unknown
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json([{ ...incidentFixture, status }]),
      ),
      http.get(`${endpoint}/12`, () =>
        HttpResponse.json({ ...incidentFixture, status }),
      ),
      http.patch(`${endpoint}/12`, async ({ request }) => {
        patchBody = await request.json()
        status = 'contained'
        return HttpResponse.json({ ...incidentFixture, status })
      }),
    )
    renderIncidents()
    const user = await openIncident()
    await user.selectOptions(
      screen.getByLabelText('Incident status'),
      'contained',
    )
    expect(patchBody).toEqual({ status: 'contained' })
    expect(await screen.findByRole('dialog')).toHaveTextContent('Contained')
  })
  it('shows a failed incident mutation', async () => {
    useIncidentHandlers()
    server.use(
      http.patch(`${endpoint}/12`, () =>
        HttpResponse.json(
          { detail: 'Incident update failed.' },
          { status: 500 },
        ),
      ),
    )
    renderIncidents()
    const user = await openIncident()
    await user.selectOptions(screen.getByLabelText('Incident status'), 'closed')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incident update failed.',
    )
  })

  it('renders closed time only when supplied by the API', async () => {
    const closedIncident = {
      ...incidentFixture,
      status: 'closed' as const,
      closed_at: '2026-08-31T12:30:00Z',
    }
    useIncidentHandlers(closedIncident)
    renderIncidents()
    await openIncident()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Closed at')
    expect(
      dialog.querySelector('time[datetime="2026-08-31T12:30:00Z"]'),
    ).toBeInTheDocument()
  })
})
