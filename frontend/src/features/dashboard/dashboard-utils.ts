import type { MetricDatum } from './dashboard-types'

export function toMetricData(values: Record<string, number>): MetricDatum[] {
  return Object.entries(values)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
}

export function humanizeMetricLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
