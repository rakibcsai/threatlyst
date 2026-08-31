import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950">
        <Spinner label="Validating session" />
      </main>
    )
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
