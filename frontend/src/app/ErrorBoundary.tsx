import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface State { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Production logging can be integrated here without logging credentials.
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-5 size-10 text-amber-400" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">ThreatLyst encountered an error</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">The interface could not continue safely. Reload to start a clean session.</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Reload application</Button>
        </div>
      </main>
    )
  }
}
