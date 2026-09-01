import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VerdictDonutChart } from './VerdictDonutChart'

describe('VerdictDonutChart responsiveness', () => {
  it.each([
    { suspicious: 0, benign: 0, rate: '0%' },
    { suspicious: 1, benign: 3, rate: '25%' },
    { suspicious: 12, benign: 0, rate: '100%' },
  ])(
    'keeps the center label readable for $rate suspicious activity',
    ({ suspicious, benign, rate }) => {
      render(<VerdictDonutChart verdicts={{ suspicious, benign }} />)
      expect(screen.getByTestId('verdict-rate')).toHaveTextContent(rate)
      expect(
        screen.getByRole('img', {
          name: `AI verdicts: ${suspicious} suspicious and ${benign} benign`,
        }),
      ).toBeInTheDocument()
    },
  )

  it('stacks the legend below the chart on mobile and restores columns on wider screens', () => {
    render(<VerdictDonutChart verdicts={{ suspicious: 8, benign: 12 }} />)
    expect(screen.getByTestId('verdict-chart-layout')).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-[minmax(0,1fr)_8rem]',
      'min-w-0',
      'overflow-hidden',
    )
    expect(screen.getByTestId('verdict-legend')).toHaveClass(
      'grid-cols-2',
      'sm:block',
    )
  })
})
