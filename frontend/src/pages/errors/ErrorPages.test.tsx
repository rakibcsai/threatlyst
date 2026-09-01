import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundRoute } from '../../app/NotFoundRoute'
import {
  AuthContext,
  type AuthContextValue,
} from '../../features/auth/auth-context'
import { ForbiddenPage } from './ForbiddenPage'

const publicAuth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => undefined,
  logout: () => undefined,
}

const authenticatedAuth: AuthContextValue = {
  ...publicAuth,
  user: {
    id: 9,
    email: 'viewer@example.com',
    username: 'viewer',
    role: 'viewer',
    is_active: true,
  },
  isAuthenticated: true,
}

function renderNotFound(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/unknown-surface']}>
        <NotFoundRoute />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('error pages', () => {
  it('keeps authenticated Not Found inside the application shell', () => {
    renderNotFound(authenticatedAuth)
    expect(
      screen.getByRole('heading', { name: 'This route does not exist' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'ThreatLyst primary navigation' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Return to dashboard' }),
    ).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('keeps the unauthenticated Not Found presentation public', () => {
    renderNotFound(publicAuth)
    expect(
      screen.getByRole('heading', { name: 'This route does not exist' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Return to ThreatLyst' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.queryByRole('navigation', {
        name: 'ThreatLyst primary navigation',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sign out' }),
    ).not.toBeInTheDocument()
  })

  it('presents a safe Forbidden route back to the dashboard', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', {
        name: 'You don’t have access to this area',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/session is still active/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Return to SOC dashboard' }),
    ).toHaveAttribute('href', '/dashboard')
    expect(
      screen.queryByText(/\b(admin|analyst|viewer)\b/i),
    ).not.toBeInTheDocument()
  })
})
