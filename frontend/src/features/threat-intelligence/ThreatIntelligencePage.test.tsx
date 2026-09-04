import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { ThreatIndicatorResponse } from './indicator-types'
import { ThreatIntelligencePage } from './ThreatIntelligencePage'

const endpoint = `${env.VITE_API_BASE_URL}/api/threat-intelligence/indicators`
const fixture: ThreatIndicatorResponse = {
  id: 9,
  indicator_type: 'domain',
  indicator_value: 'command.example',
  threat_type: 'command-and-control',
  confidence: 92,
  severity: 'critical',
  source: 'Internal SOC',
  description: 'Observed in authenticated proxy telemetry.',
  is_active: true,
}

function renderPage(role: UserRole = 'analyst') {
  const client = new QueryClient({
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
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={auth}>
        <ThreatIntelligencePage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}
function handlers(item = fixture) {
  server.use(
    http.get(endpoint, () => HttpResponse.json([item])),
    http.get(`${endpoint}/${item.id}`, () => HttpResponse.json(item)),
  )
}
async function open() {
  const user = userEvent.setup()
  await user.click(
    (await screen.findAllByRole('button', { name: 'Open indicator 9' }))[0],
  )
  return user
}

describe('ThreatIntelligencePage', () => {
  it('renders the indicator list', async () => {
    handlers()
    renderPage()
    expect(
      (await screen.findAllByText('command.example')).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('92% confidence').length).toBeGreaterThan(0)
  })
  it('renders the empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderPage()
    expect(await screen.findByText('No indicators yet')).toBeInTheDocument()
  })
  it('renders the API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'IOC service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('Threat intelligence unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('IOC service unavailable.')).toBeInTheDocument()
  })
  it('opens indicator details', async () => {
    handlers()
    renderPage()
    await open()
    const dialog = screen.getByRole('dialog', { name: 'command.example' })
    expect(dialog).toHaveTextContent('IOC-9')
    expect(dialog).toHaveTextContent('command-and-control')
    expect(dialog).toHaveTextContent('Internal SOC')
    expect(dialog).toHaveTextContent(
      'Observed in authenticated proxy telemetry.',
    )
  })
  it.each<UserRole>(['admin', 'analyst'])(
    'allows %s creation access',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json([])))
      renderPage(role)
      expect(
        await screen.findByRole('button', { name: 'Add indicator' }),
      ).toBeInTheDocument()
    },
  )
  it('keeps viewers read-only', async () => {
    handlers()
    renderPage('viewer')
    expect(await screen.findByText('Read-only access')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add indicator' }),
    ).not.toBeInTheDocument()
    await open()
    expect(
      screen.queryByRole('button', { name: 'Save changes' }),
    ).not.toBeInTheDocument()
  })
  it('creates an indicator with contract fields', async () => {
    let body: unknown
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(fixture)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'Add indicator' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Add threat indicator' })
    await user.selectOptions(
      within(dialog).getByLabelText('Indicator type'),
      'domain',
    )
    await user.type(
      within(dialog).getByLabelText('Indicator value'),
      'command.example',
    )
    await user.type(within(dialog).getByLabelText('Source'), 'Internal SOC')
    await user.type(
      within(dialog).getByLabelText('Threat type'),
      'command-and-control',
    )
    await user.selectOptions(
      within(dialog).getByLabelText('Severity'),
      'critical',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Add indicator' }),
    )
    expect(body).toMatchObject({
      indicator_type: 'domain',
      indicator_value: 'command.example',
      source: 'Internal SOC',
      threat_type: 'command-and-control',
      confidence: 50,
      severity: 'critical',
    })
  })
  it('updates supported indicator fields', async () => {
    let body: unknown
    let item = fixture
    server.use(
      http.get(endpoint, () => HttpResponse.json([item])),
      http.get(`${endpoint}/9`, () => HttpResponse.json(item)),
      http.patch(`${endpoint}/9`, async ({ request }) => {
        body = await request.json()
        item = { ...fixture, confidence: 75 }
        return HttpResponse.json(item)
      }),
    )
    renderPage()
    const user = await open()
    const confidence = screen.getByLabelText('Confidence')
    await user.clear(confidence)
    await user.type(confidence, '75')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(body).toMatchObject({ confidence: 75, is_active: true })
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      '75% confidence',
    )
  })
  it('shows failed mutation handling', async () => {
    handlers()
    server.use(
      http.patch(`${endpoint}/9`, () =>
        HttpResponse.json({ detail: 'IOC update failed.' }, { status: 500 }),
      ),
    )
    renderPage()
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'IOC update failed.',
    )
  })
  it('filters the returned indicator dataset client-side', async () => {
    handlers()
    renderPage()
    const user = userEvent.setup()
    await screen.findAllByText('command.example')
    await user.type(screen.getByLabelText('Search indicators'), 'not-present')
    expect(screen.getByText('No matching indicators')).toBeInTheDocument()
  })
})
