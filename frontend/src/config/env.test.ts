import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from './env'

describe('API base URL resolution', () => {
  it('uses the configured local backend for development', () => {
    expect(
      resolveApiBaseUrl(
        'http://127.0.0.1:8000',
        false,
        'http://localhost:5173',
      ),
    ).toBe('http://127.0.0.1:8000')
  })

  it('fails clearly when development configuration is missing', () => {
    expect(() =>
      resolveApiBaseUrl(undefined, false, 'http://localhost:5173'),
    ).toThrow()
  })

  it('uses a configured HTTPS API in production', () => {
    expect(
      resolveApiBaseUrl(
        'https://api.threatlyst.example/',
        true,
        'https://threatlyst.example',
      ),
    ).toBe('https://api.threatlyst.example')
  })

  it('uses the secure frontend origin when production has no API override', () => {
    expect(
      resolveApiBaseUrl(undefined, true, 'https://threatlyst.example'),
    ).toBe('https://threatlyst.example')
  })

  it('rejects an insecure production topology', () => {
    expect(() =>
      resolveApiBaseUrl(
        'http://127.0.0.1:8000',
        true,
        'http://threatlyst.example',
      ),
    ).toThrow(/requires an HTTPS API URL/i)
  })
})
