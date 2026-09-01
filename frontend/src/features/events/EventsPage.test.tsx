import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import type { FullEventResponse, SecurityEvent } from './event-types'
import { EventsPage } from './EventsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/events`

const storedEvent: SecurityEvent = {
  event_id: 'evt-001',
  timestamp: '2026-09-01T01:15:00Z',
  source: 'windows-defender',
  event_type: 'failed_login',
  source_ip: '10.0.0.24',
  destination_ip: '192.0.2.18',
  username: 'test.user',
  hostname: 'SOC-WS-14',
  severity: 'high',
  message: 'Repeated failed login attempts detected',
  raw_data: { failed_attempts: 8 },
}

const analysisResponse: FullEventResponse = {
  status: 'received',
  event_id: 'evt-new',
  event_type: 'failed_login',
  rule_analysis: {
    event_id: 'evt-new',
    risk_score: 95,
    risk_level: 'critical',
    reasons: ['TL-AUTH-001 matched repeated failed login behavior'],
  },
  ai_analysis: {
    event_id: 'evt-new',
    verdict: 'suspicious',
    confidence: 0.94,
    anomaly_score: -0.31,
    risk_score: 0.91,
    risk_level: 'critical',
    explanation: 'Authentication behavior is inconsistent with the baseline.',
    attack_category: 'credential_access',
    indicators: ['Repeated authentication failures'],
    mitre_techniques: ['T1110'],
    recommended_actions: ['Temporarily lock the affected account'],
  },
}

function renderEvents(role: UserRole = 'analyst') {
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
        <EventsPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

async function openAndFillSubmission() {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Analyze event' }))
  await user.type(screen.getByLabelText(/Event ID/), 'evt-new')
  await user.type(screen.getByLabelText(/Source \*/), 'windows-defender')
  await user.type(screen.getByLabelText(/Event type/), 'failed_login')
  await user.type(
    screen.getByLabelText(/Message/),
    'Repeated failed login attempts',
  )
  return user
}

describe('EventsPage', () => {
  it('renders stored events returned by the list API', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()

    expect(
      (await screen.findAllByText('Repeated failed login attempts detected'))
        .length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Failed Login').length).toBeGreaterThan(0)
    expect(screen.getAllByText('evt-001').length).toBeGreaterThan(0)
    expect(screen.getByText(/of 1 events/)).toBeInTheDocument()
  })

  it('opens stored event details from the event list', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()
    const user = userEvent.setup()

    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0],
    )

    expect(
      screen.getByRole('dialog', { name: 'Failed Login' }),
    ).toBeInTheDocument()
  })

  it('renders every stored event field in the details view', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()
    const user = userEvent.setup()
    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0],
    )

    expect(screen.getByRole('dialog')).toHaveTextContent('evt-001')
    expect(screen.getByRole('dialog')).toHaveTextContent('Sep 01, 2026')
    expect(screen.getByRole('dialog')).toHaveTextContent('high')
    expect(screen.getByRole('dialog')).toHaveTextContent('Failed Login')
    expect(screen.getByRole('dialog')).toHaveTextContent('windows-defender')
    expect(screen.getByRole('dialog')).toHaveTextContent('10.0.0.24')
    expect(screen.getByRole('dialog')).toHaveTextContent('192.0.2.18')
    expect(screen.getByRole('dialog')).toHaveTextContent('test.user')
    expect(screen.getByRole('dialog')).toHaveTextContent('SOC-WS-14')
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Repeated failed login attempts detected',
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('"failed_attempts": 8')
  })

  it('explains the historical-analysis limitation in stored details', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()
    const user = userEvent.setup()
    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0],
    )

    expect(
      screen.getByText(/Historical AI analysis is not available/i),
    ).toBeInTheDocument()
  })

  it('closes stored event details with the close button', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()
    const user = userEvent.setup()
    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0],
    )
    await user.click(
      screen.getAllByRole('button', {
        name: 'Close stored event details',
      })[1],
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes stored event details with Escape', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents()
    const user = userEvent.setup()
    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0],
    )
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each(['{Enter}', ' '])(
    'opens stored event details with the %s key',
    async (key) => {
      server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
      renderEvents()
      const user = userEvent.setup()
      const row = (
        await screen.findAllByRole('button', {
          name: 'View details for event evt-001',
        })
      )[0]

      row.focus()
      await user.keyboard(key)

      expect(
        screen.getByRole('dialog', { name: 'Failed Login' }),
      ).toBeInTheDocument()
    },
  )

  it('renders the empty events state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderEvents()
    expect(
      await screen.findByText('No security events yet'),
    ).toBeInTheDocument()
  })

  it('renders the events API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Event store unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderEvents()
    expect(
      await screen.findByText('Security events unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('Event store unavailable.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })

  it.each<UserRole>(['admin', 'analyst'])(
    'allows %s users to submit events',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json([])))
      renderEvents(role)
      expect(
        await screen.findByRole('button', { name: 'Analyze event' }),
      ).toBeInTheDocument()
    },
  )

  it('keeps viewers read-only', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([storedEvent])))
    renderEvents('viewer')
    expect(await screen.findByText('Read-only access')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Analyze event' }),
    ).not.toBeInTheDocument()
  })

  it('submits an event, refreshes the list, and renders the immediate analysis', async () => {
    let submittedBody: unknown
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, async ({ request }) => {
        submittedBody = await request.json()
        return HttpResponse.json(analysisResponse)
      }),
    )
    renderEvents('analyst')
    const user = await openAndFillSubmission()
    await user.click(screen.getByRole('button', { name: 'Submit and analyze' }))

    expect(await screen.findByText('Analysis complete')).toBeInTheDocument()
    expect(submittedBody).toMatchObject({
      event_id: 'evt-new',
      source: 'windows-defender',
      event_type: 'failed_login',
      severity: 'medium',
      message: 'Repeated failed login attempts',
      raw_data: {},
    })
    expect(screen.getByText('94%')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Authentication behavior is inconsistent with the baseline.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('T1110')).toBeInTheDocument()
    expect(
      screen.getByText('Temporarily lock the affected account'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/cannot be reopened from the stored-event list/i),
    ).toBeInTheDocument()
  })

  it('shows a failed submission message without losing the form', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, () =>
        HttpResponse.json(
          { detail: 'An event with this event_id already exists.' },
          { status: 409 },
        ),
      ),
    )
    renderEvents('admin')
    const user = await openAndFillSubmission()
    await user.click(screen.getByRole('button', { name: 'Submit and analyze' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An event with this event_id already exists.',
    )
    expect(screen.getByLabelText(/Event ID/)).toHaveValue('evt-new')
  })
})
