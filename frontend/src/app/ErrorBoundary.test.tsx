import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenSurface(): never {
  throw new Error('Sensitive internal implementation detail')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('shows an accessible fallback without internal details', () => {
    render(
      <ErrorBoundary>
        <BrokenSurface />
      </ErrorBoundary>,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAccessibleName('ThreatLyst encountered an error')
    expect(screen.getByText(/could not continue safely/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/Sensitive internal implementation detail/i),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/stack/i)).not.toBeInTheDocument()
  })

  it('invokes the safe recovery action', async () => {
    const reload = vi.fn()
    const user = userEvent.setup()
    render(
      <ErrorBoundary onReload={reload}>
        <BrokenSurface />
      </ErrorBoundary>,
    )
    await user.click(screen.getByRole('button', { name: 'Reload application' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
