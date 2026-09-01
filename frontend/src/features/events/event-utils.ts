import type { SecurityEvent } from './event-types'

export function formatEventLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatEventTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function eventMatchesSearch(event: SecurityEvent, search: string) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return true
  return [
    event.event_id,
    event.source,
    event.event_type,
    event.source_ip,
    event.destination_ip,
    event.username,
    event.hostname,
    event.message,
  ].some((value) => value?.toLowerCase().includes(normalized))
}
