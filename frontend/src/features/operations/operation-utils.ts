export function formatOperationLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatOperationTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function matchesOperationSearch(
  values: Array<string | number | null>,
  search: string,
) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return true
  return values.some((value) =>
    String(value ?? '')
      .toLowerCase()
      .includes(normalized),
  )
}

export function activateOperation(
  keyboardEvent: KeyboardEvent,
  action: () => void,
) {
  if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
  keyboardEvent.preventDefault()
  action()
}
import type { KeyboardEvent } from 'react'
