import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
} from '../features/auth/auth-context'
import type { UserRole } from '../types/auth'
import { ProtectedRoute } from './ProtectedRoute'

const baseAuth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => undefined,
  logout: () => undefined,
}

function renderRoute(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>SOC dashboard route</div>} />
          </Route>
          <Route path="/login" element={<div>Login route</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function renderEventsRoute(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/events']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<div>Events route</div>} />
          </Route>
          <Route path="/login" element={<div>Login route</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function renderOperationsRoute(
  path:
    | '/alerts'
    | '/incidents'
    | '/threat-intelligence'
    | '/mitre'
    | '/notifications'
    | '/reports',
) {
  return render(
    <AuthContext.Provider value={baseAuth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path={path} element={<div>Operations route</div>} />
          </Route>
          <Route path="/login" element={<div>Login route</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('dashboard route access', () => {
  it('redirects unauthenticated users to login', () => {
    renderRoute(baseAuth)
    expect(screen.getByText('Login route')).toBeInTheDocument()
  })

  it.each<UserRole>(['admin', 'analyst', 'viewer'])(
    'allows an authenticated %s',
    (role) => {
      renderRoute({
        ...baseAuth,
        isAuthenticated: true,
        user: {
          id: 1,
          email: `${role}@example.com`,
          username: role,
          role,
          is_active: true,
        },
      })
      expect(screen.getByText('SOC dashboard route')).toBeInTheDocument()
    },
  )

  it('protects the events route from unauthenticated access', () => {
    renderEventsRoute(baseAuth)
    expect(screen.getByText('Login route')).toBeInTheDocument()
  })

  it.each([
    '/alerts',
    '/incidents',
    '/threat-intelligence',
    '/mitre',
    '/notifications',
    '/reports',
  ] as const)('protects the %s route from unauthenticated access', (path) => {
    renderOperationsRoute(path)
    expect(screen.getByText('Login route')).toBeInTheDocument()
  })
})
