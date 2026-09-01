import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeedbackMessage } from './FeedbackMessage'

describe('FeedbackMessage', () => {
  it('announces success feedback politely in one atomic region', () => {
    render(<FeedbackMessage tone="success">Record saved.</FeedbackMessage>)
    const feedback = screen.getByText('Record saved.').closest('[aria-live]')
    expect(feedback).toHaveAttribute('aria-live', 'polite')
    expect(feedback).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getAllByText('Record saved.')).toHaveLength(1)
  })

  it('announces error feedback assertively in one atomic region', () => {
    render(<FeedbackMessage tone="error">Save failed.</FeedbackMessage>)
    const feedback = screen.getByText('Save failed.').closest('[aria-live]')
    expect(feedback).toHaveAttribute('aria-live', 'assertive')
    expect(feedback).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getAllByText('Save failed.')).toHaveLength(1)
  })
})
