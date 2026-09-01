import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'
import { LazyDashboardRoute } from './LazyDashboardRoute'
import { LazyEventsRoute } from './LazyEventsRoute'
import { LazyAlertsRoute } from './LazyAlertsRoute'
import { LazyIncidentsRoute } from './LazyIncidentsRoute'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/workspace', element: <Navigate to="/dashboard" replace /> },
          {
            path: '/dashboard',
            element: <LazyDashboardRoute />,
          },
          { path: '/events', element: <LazyEventsRoute /> },
          { path: '/alerts', element: <LazyAlertsRoute /> },
          { path: '/incidents', element: <LazyIncidentsRoute /> },
          { path: '/forbidden', element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
