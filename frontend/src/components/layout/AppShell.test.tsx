import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
} from '../../features/auth/auth-context'
import { AppShell } from './AppShell'
import type { UserRole } from '../../types/auth'

const auth: AuthContextValue = {
  user: {
    id: 1,
    email: 'analyst@example.com',
    username: 'analyst',
    role: 'analyst',
    is_active: true,
  },
  isAuthenticated: true,
  isLoading: false,
  login: async () => undefined,
  logout: async () => undefined,
}

function LocationView() {
  const location = useLocation()
  return <p>Current route: {location.pathname}</p>
}

function renderShell() {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="*" element={<LocationView />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AppShell mobile navigation', () => {
  it('opens and closes the mobile menu with accurate expanded state', async () => {
    renderShell()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', 'primary-sidebar')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByLabelText('ThreatLyst navigation panel'),
    ).toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: 'Close navigation' })[0],
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes after selecting a real navigation link', async () => {
    renderShell()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(trigger)
    await user.click(screen.getByRole('link', { name: 'Alerts' }))

    expect(screen.getByText('Current route: /alerts')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not move focus to the hidden menu trigger during desktop navigation', async () => {
    renderShell()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    const alerts = screen.getByRole('link', { name: 'Alerts' })
    await user.click(alerts)

    expect(screen.getByText('Current route: /alerts')).toBeInTheDocument()
    expect(trigger).not.toHaveFocus()
  })

  it('closes on Escape and restores focus to the menu trigger', async () => {
    renderShell()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(trigger)
    expect(
      screen.getAllByRole('button', { name: 'Close navigation' })[0],
    ).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('locks background scrolling and marks page content inert while open', async () => {
    renderShell()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    const content = trigger.closest('.min-w-0')
    await user.click(trigger)

    expect(document.body.style.overflow).toBe('hidden')
    expect(content).toHaveAttribute('inert')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.body.style.overflow).toBe(''))
    expect(content).not.toHaveAttribute('inert')
  })

  it('provides a scrollable, labeled primary navigation container', () => {
    renderShell()
    const navigation = screen.getByRole('navigation', {
      name: 'ThreatLyst primary navigation',
    })
    expect(navigation).toHaveClass('overflow-y-auto', 'overscroll-contain')
  })

  it('uses context-neutral header copy and removes development wording', () => {
    renderShell()
    expect(
      screen.getByText('Protected operations workspace'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Threat intelligence overview'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/later approved phases/i)).not.toBeInTheDocument()
  })

  it.each<UserRole>(['admin', 'analyst', 'viewer'])(
    'renders the enterprise footer for the authenticated %s shell',
    (role) => {
      render(
        <AuthContext.Provider
          value={{ ...auth, user: { ...auth.user!, role } }}
        >
          <MemoryRouter>
            <AppShell>
              <p>Authenticated content</p>
            </AppShell>
          </MemoryRouter>
        </AuthContext.Provider>,
      )
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveTextContent(
        `© ${new Date().getFullYear()} ThreatLyst`,
      )
      expect(footer).toHaveTextContent('Security Operations Platform')
      expect(within(footer).queryByRole('link')).not.toBeInTheDocument()
    },
  )
})
