import { z } from 'zod'

const urlSchema = z.string().url()

function normalizeUrl(value: string) {
  return value.replace(/\/$/, '')
}

export function resolveApiBaseUrl(
  configuredValue: string | undefined,
  production: boolean,
  browserOrigin: string,
) {
  const configured = configuredValue?.trim()

  if (!production) return normalizeUrl(urlSchema.parse(configured))

  if (configured) {
    const configuredUrl = new URL(urlSchema.parse(configured))
    if (configuredUrl.protocol === 'https:')
      return normalizeUrl(configuredUrl.toString())
  }

  const originUrl = new URL(urlSchema.parse(browserOrigin))
  if (originUrl.protocol !== 'https:')
    throw new Error(
      'ThreatLyst production requires an HTTPS API URL or HTTPS same-origin hosting.',
    )
  return normalizeUrl(originUrl.toString())
}

export const env = {
  VITE_API_BASE_URL: resolveApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.PROD,
    window.location.origin,
  ),
}
