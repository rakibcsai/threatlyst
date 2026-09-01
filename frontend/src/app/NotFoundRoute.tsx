import { AppShell } from '../components/layout/AppShell'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { NotFoundPage } from '../pages/errors/NotFoundPage'

export function NotFoundRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950">
        <Spinner label="Validating session" />
      </main>
    )

  if (isAuthenticated)
    return (
      <AppShell>
        <NotFoundPage authenticated />
      </AppShell>
    )

  return <NotFoundPage />
}
