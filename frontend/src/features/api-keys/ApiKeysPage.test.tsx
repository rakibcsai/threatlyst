import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RoleRoute } from '../../app/RoleRoute'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { UserRole } from '../../types/auth'
import { AuthContext, type AuthContextValue } from '../auth/auth-context'
import type { APIKeyCreateResponse, APIKeyResponse } from './api-key-types'
import { ApiKeysPage } from './ApiKeysPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/api-keys`
const rawKey = ['tl', 'live', 'generated-once-fixture'].join('_')
const active: APIKeyResponse = {
  id: 12,
  name: 'SIEM ingestion',
  key_prefix: 'tl_live_example1',
  is_active: true,
  created_by_user_id: 1,
}
const revoked: APIKeyResponse = {
  id: 13,
  name: 'Legacy collector',
  key_prefix: 'tl_live_example2',
  is_active: false,
  created_by_user_id: 1,
}
const created: APIKeyCreateResponse = { ...active, api_key: rawKey }

function client() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderPage() {
  return render(
    <QueryClientProvider client={client()}>
      <ApiKeysPage />
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
        <MemoryRouter initialEntries={['/api-keys']}>
          <Routes>
            <Route
              path="/api-keys"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <ApiKeysPage />
                </RoleRoute>
              }
            />
            <Route
              path="/forbidden"
              element={<div>Forbidden API keys route</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

async function createKey() {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', { name: 'Create API key' }),
  )
  const dialog = screen.getByRole('dialog', { name: 'Create API key' })
  await user.type(
    within(dialog).getByLabelText('API key name'),
    'SIEM ingestion',
  )
  await user.click(
    within(dialog).getByRole('button', { name: 'Create API key' }),
  )
  return user
}

describe('ApiKeysPage', () => {
  it('renders API key metadata without a raw key', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([active, revoked])))
    renderPage()
    expect(
      (await screen.findAllByText('SIEM ingestion')).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('tl_live_example1').length).toBeGreaterThan(0)
    expect(screen.queryByDisplayValue(rawKey)).not.toBeInTheDocument()
  })

  it('renders an empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderPage()
    expect(await screen.findByText('No API keys yet')).toBeInTheDocument()
  })

  it('renders an API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Key service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(await screen.findByText('API keys unavailable')).toBeInTheDocument()
    expect(screen.getByText('Key service unavailable.')).toBeInTheDocument()
  })

  it('allows administrators', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([active])))
    renderRole('admin')
    expect(
      await screen.findByRole('heading', { name: 'API Key Management' }),
    ).toBeInTheDocument()
  })

  it.each<UserRole>(['analyst', 'viewer'])(
    'redirects %s users to forbidden',
    async (role) => {
      renderRole(role)
      expect(
        await screen.findByText('Forbidden API keys route'),
      ).toBeInTheDocument()
    },
  )

  it('creates a key with the exact request and shows its one-time secret', async () => {
    let body: unknown
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(created)
      }),
    )
    renderPage()
    await createKey()
    expect(body).toEqual({ name: 'SIEM ingestion' })
    const secret = await screen.findByRole('dialog', {
      name: 'API key created',
    })
    expect(within(secret).getByDisplayValue(rawKey)).toBeInTheDocument()
    expect(secret).toHaveTextContent('will not be shown again')
  })

  it('copies the one-time key through the Clipboard API', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, () => HttpResponse.json(created)),
    )
    renderPage()
    const user = await createKey()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    await user.click(await screen.findByRole('button', { name: 'Copy key' }))
    expect(writeText).toHaveBeenCalledWith(rawKey)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('clears the raw key when the one-time dialog closes', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, () => HttpResponse.json(created)),
    )
    renderPage()
    const user = await createKey()
    await user.click(
      await screen.findByRole('button', { name: 'I have saved this key' }),
    )
    expect(screen.queryByDisplayValue(rawKey)).not.toBeInTheDocument()
  })

  it('revokes an active key after confirmation', async () => {
    let item = active
    let deletes = 0
    server.use(
      http.get(endpoint, () => HttpResponse.json([item])),
      http.delete(`${endpoint}/12`, () => {
        deletes += 1
        item = { ...item, is_active: false }
        return HttpResponse.json(item)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (await screen.findAllByRole('button', { name: 'Revoke' }))[0],
    )
    const dialog = screen.getByRole('dialog', { name: 'Revoke API key' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm revoke' }),
    )
    expect(deletes).toBe(1)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'SIEM ingestion',
    )
  })

  it('shows a failed create mutation', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, () =>
        HttpResponse.json({ detail: 'Key creation failed.' }, { status: 500 }),
      ),
    )
    renderPage()
    await createKey()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Key creation failed.',
    )
  })

  it('shows a failed revoke mutation', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([active])),
      http.delete(`${endpoint}/12`, () =>
        HttpResponse.json({ detail: 'Key revoke failed.' }, { status: 500 }),
      ),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (await screen.findAllByRole('button', { name: 'Revoke' }))[0],
    )
    await user.click(screen.getByRole('button', { name: 'Confirm revoke' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Key revoke failed.',
    )
  })

  it('does not expose unsupported API-key controls or fields', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([active])))
    renderPage()
    await screen.findAllByText('SIEM ingestion')
    expect(
      screen.queryByRole('button', { name: /rotate|delete|reactivate/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/last used|expires|scope|usage count/i),
    ).not.toBeInTheDocument()
  })

  it('does not persist the generated raw key in browser storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    server.use(
      http.get(endpoint, () => HttpResponse.json([])),
      http.post(endpoint, () => HttpResponse.json(created)),
    )
    renderPage()
    await createKey()
    expect(setItem.mock.calls.flat()).not.toContain(rawKey)
    setItem.mockRestore()
  })
})
