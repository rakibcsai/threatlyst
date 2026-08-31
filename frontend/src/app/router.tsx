import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'
import { WorkspacePage } from '../pages/WorkspacePage'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/workspace" replace /> },
        { path: '/workspace', element: <WorkspacePage /> },
        { path: '/forbidden', element: <ForbiddenPage /> },
      ],
    }],
  },
  { path: '*', element: <NotFoundPage /> },
])
