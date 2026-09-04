import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import { MitrePage } from './MitrePage'
import type { MITRETechniqueResponse } from './mitre-types'

const endpoint = `${env.VITE_API_BASE_URL}/api/mitre/techniques`
const fixture: MITRETechniqueResponse = {
  id: 4,
  technique_id: 'T1110',
  name: 'Brute Force',
  tactic: 'Credential Access',
  description: 'Adversaries may use brute-force techniques to gain access.',
  source: 'MITRE ATT&CK',
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
        <MitrePage />
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
    (await screen.findAllByRole('button', { name: 'Open technique T1110' }))[0],
  )
  return user
}

describe('MitrePage', () => {
  it('renders the technique list', async () => {
    handlers()
    renderPage()
    expect((await screen.findAllByText('T1110')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Brute Force').length).toBeGreaterThan(0)
  })
  it('renders the empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderPage()
    expect(await screen.findByText('No techniques yet')).toBeInTheDocument()
  })
  it('renders the API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'MITRE service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('MITRE catalog unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('MITRE service unavailable.')).toBeInTheDocument()
  })
  it('opens technique details', async () => {
    handlers()
    renderPage()
    await open()
    const dialog = screen.getByRole('dialog', { name: 'Brute Force' })
    expect(dialog).toHaveTextContent('T1110')
    expect(dialog).toHaveTextContent('Credential Access')
    expect(dialog).toHaveTextContent('Adversaries may use brute-force')
  })
  it.each<UserRole>(['admin', 'analyst'])(
    'allows %s creation access',
    async (role) => {
      server.use(http.get(endpoint, () => HttpResponse.json([])))
      renderPage(role)
      expect(
        await screen.findByRole('button', { name: 'Add technique' }),
      ).toBeInTheDocument()
    },
  )
  it('keeps viewers read-only', async () => {
    handlers()
    renderPage('viewer')
    expect(await screen.findByText('Read-only access')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add technique' }),
    ).not.toBeInTheDocument()
    await open()
    expect(
      screen.queryByRole('button', { name: 'Save changes' }),
    ).not.toBeInTheDocument()
  })
  it('creates a technique with contract fields', async () => {
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
      await screen.findByRole('button', { name: 'Add technique' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Add ATT&CK technique' })
    await user.type(within(dialog).getByLabelText('Technique ID'), 'T1110')
    await user.type(within(dialog).getByLabelText('Name'), 'Brute Force')
    await user.type(
      within(dialog).getByLabelText('Tactic'),
      'Credential Access',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Add technique' }),
    )
    expect(body).toMatchObject({
      technique_id: 'T1110',
      name: 'Brute Force',
      tactic: 'Credential Access',
      source: 'MITRE ATT&CK',
    })
  })
  it('updates supported technique fields', async () => {
    let body: unknown
    let item = fixture
    server.use(
      http.get(endpoint, () => HttpResponse.json([item])),
      http.get(`${endpoint}/4`, () => HttpResponse.json(item)),
      http.patch(`${endpoint}/4`, async ({ request }) => {
        body = await request.json()
        item = { ...fixture, name: 'Password Guessing' }
        return HttpResponse.json(item)
      }),
    )
    renderPage()
    const user = await open()
    const name = screen.getByLabelText('Name')
    await user.type(name, '{Control>}a{/Control}Password Guessing')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(body).toMatchObject({
      name: 'Password Guessing',
      tactic: 'Credential Access',
    })
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Password Guessing',
    )
  })
  it('shows failed mutation handling', async () => {
    handlers()
    server.use(
      http.patch(`${endpoint}/4`, () =>
        HttpResponse.json(
          { detail: 'Technique update failed.' },
          { status: 500 },
        ),
      ),
    )
    renderPage()
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Technique update failed.',
    )
  })
  it('filters the returned catalog client-side', async () => {
    handlers()
    renderPage()
    const user = userEvent.setup()
    await screen.findAllByText('T1110')
    await user.type(screen.getByLabelText('Search techniques'), 'not-present')
    expect(screen.getByText('No matching techniques')).toBeInTheDocument()
  })
})
