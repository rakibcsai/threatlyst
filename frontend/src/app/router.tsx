import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'
import { LazyDashboardRoute } from './LazyDashboardRoute'
import { LazyEventsRoute } from './LazyEventsRoute'
import { LazyAlertsRoute } from './LazyAlertsRoute'
import { LazyIncidentsRoute } from './LazyIncidentsRoute'
import { LazyMitreRoute } from './LazyMitreRoute'
import { LazyThreatIntelligenceRoute } from './LazyThreatIntelligenceRoute'
import { LazyNotificationsRoute } from './LazyNotificationsRoute'
import { LazyReportsRoute } from './LazyReportsRoute'
import { LazyAuditRoute } from './LazyAuditRoute'
import { LazyApiKeysRoute } from './LazyApiKeysRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

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
          {
            path: '/threat-intelligence',
            element: <LazyThreatIntelligenceRoute />,
          },
          { path: '/mitre', element: <LazyMitreRoute /> },
          { path: '/notifications', element: <LazyNotificationsRoute /> },
          {
            path: '/reports',
            element: (
              <RoleRoute allowedRoles={['admin', 'analyst']}>
                <LazyReportsRoute />
              </RoleRoute>
            ),
          },
          {
            path: '/audit',
            element: (
              <RoleRoute allowedRoles={['admin']}>
                <LazyAuditRoute />
              </RoleRoute>
            ),
          },
          {
            path: '/api-keys',
            element: (
              <RoleRoute allowedRoles={['admin']}>
                <LazyApiKeysRoute />
              </RoleRoute>
            ),
          },
          { path: '/forbidden', element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
