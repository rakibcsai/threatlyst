import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { LazyAlertsRoute } from './LazyAlertsRoute'
import { LazyApiKeysRoute } from './LazyApiKeysRoute'
import { LazyAuditRoute } from './LazyAuditRoute'
import { LazyDashboardRoute } from './LazyDashboardRoute'
import { LazyEventsRoute } from './LazyEventsRoute'
import { LazyIncidentsRoute } from './LazyIncidentsRoute'
import { LazyMitreRoute } from './LazyMitreRoute'
import { LazyNotificationsRoute } from './LazyNotificationsRoute'
import { LazyReportsRoute } from './LazyReportsRoute'
import { LazySystemHealthRoute } from './LazySystemHealthRoute'
import { LazyThreatIntelligenceRoute } from './LazyThreatIntelligenceRoute'
import { LazyUserSessionsRoute } from './LazyUserSessionsRoute'
import { NotFoundRoute } from './NotFoundRoute'
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
          { path: '/system-health', element: <LazySystemHealthRoute /> },
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
          {
            path: '/admin/sessions',
            element: (
              <RoleRoute allowedRoles={['admin']}>
                <LazyUserSessionsRoute />
              </RoleRoute>
            ),
          },
          { path: '/forbidden', element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
])
