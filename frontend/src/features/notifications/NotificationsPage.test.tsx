import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { env } from '../../config/env'
import { server } from '../../test/server'
import type { NotificationResponse } from './notification-types'
import { NotificationsPage } from './NotificationsPage'

const endpoint = `${env.VITE_API_BASE_URL}/api/notifications`
const unread: NotificationResponse = {
  id: 31,
  user_id: 7,
  notification_type: 'incident_updated',
  title: 'Incident escalated',
  message: 'Credential access investigation moved to active response.',
  severity: 'high',
  resource_type: 'incident',
  resource_id: 'INC-12',
  is_read: false,
  created_at: '2026-08-31T10:15:00Z',
  read_at: null,
}
const read: NotificationResponse = {
  ...unread,
  id: 32,
  user_id: null,
  notification_type: 'alert_created',
  title: 'New alert created',
  message: 'A suspicious authentication alert was created.',
  severity: 'medium',
  resource_type: 'alert',
  resource_id: '44',
  is_read: true,
  read_at: '2026-08-31T10:20:00Z',
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <NotificationsPage />
    </QueryClientProvider>,
  )
}

describe('NotificationsPage', () => {
  it('renders notifications returned by the API', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([unread, read])))
    renderPage()
    expect(
      (await screen.findAllByText('Incident escalated')).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('New alert created').length).toBeGreaterThan(0)
    expect(screen.getByText('1 unread')).toBeInTheDocument()
  })

  it('renders an empty state', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([])))
    renderPage()
    expect(await screen.findByText('No notifications yet')).toBeInTheDocument()
  })

  it('renders an API error state', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          { detail: 'Notification service unavailable.' },
          { status: 503 },
        ),
      ),
    )
    renderPage()
    expect(
      await screen.findByText('Notifications unavailable'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Notification service unavailable.'),
    ).toBeInTheDocument()
  })

  it('retries a failed list request', async () => {
    let requests = 0
    server.use(
      http.get(endpoint, () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json({ detail: 'Temporary outage.' }, { status: 503 })
          : HttpResponse.json([unread])
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(
      (await screen.findAllByText('Incident escalated')).length,
    ).toBeGreaterThan(0)
  })

  it('visually distinguishes unread and read records', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([unread, read])))
    renderPage()
    expect((await screen.findAllByText('Unread')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0)
  })

  it('marks one notification as read with the supported endpoint', async () => {
    let item = unread
    let patches = 0
    server.use(
      http.get(endpoint, () => HttpResponse.json([item])),
      http.patch(`${endpoint}/31/read`, () => {
        patches += 1
        item = { ...item, is_read: true, read_at: '2026-08-31T10:30:00Z' }
        return HttpResponse.json(item)
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (await screen.findAllByRole('button', { name: 'Mark read' }))[0],
    )
    expect(patches).toBe(1)
    expect(await screen.findByText('0 unread')).toBeInTheDocument()
  })

  it('shows a failed mark-as-read mutation', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([unread])),
      http.patch(`${endpoint}/31/read`, () =>
        HttpResponse.json({ detail: 'Read update failed.' }, { status: 500 }),
      ),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (await screen.findAllByRole('button', { name: 'Mark read' }))[0],
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Read update failed.',
    )
  })

  it('opens notification details from the rendered record', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json([unread])),
      http.get(`${endpoint}/31`, () => HttpResponse.json(unread)),
    )
    renderPage()
    const user = userEvent.setup()
    await user.click(
      (
        await screen.findAllByRole('button', { name: 'Open notification 31' })
      )[0],
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Incident escalated',
    })
    expect(dialog).toHaveTextContent('Credential access investigation')
    expect(dialog).toHaveTextContent('INC-12')
  })

  it('filters the returned notifications client-side', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json([unread, read])))
    renderPage()
    const user = userEvent.setup()
    await screen.findAllByText('Incident escalated')
    await user.type(
      screen.getByLabelText('Search notifications'),
      'not present',
    )
    expect(screen.getByText('No matching notifications')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    server.use(
      http.get(endpoint, async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    )
    renderPage()
    expect(screen.getByLabelText('Loading notifications')).toBeInTheDocument()
  })
})
