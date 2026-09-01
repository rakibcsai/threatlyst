export const indicatorTypes = [
  'ip',
  'domain',
  'url',
  'file_hash',
  'email',
] as const
export const threatSeverities = ['low', 'medium', 'high', 'critical'] as const
export type IndicatorType = (typeof indicatorTypes)[number]
export type ThreatSeverity = (typeof threatSeverities)[number]

export interface ThreatIndicatorCreate {
  indicator_type: IndicatorType
  indicator_value: string
  source: string
  threat_type?: string | null
  confidence?: number
  severity?: ThreatSeverity
  description?: string | null
}

export interface ThreatIndicatorUpdate {
  threat_type?: string | null
  confidence?: number | null
  severity?: ThreatSeverity | null
  description?: string | null
  is_active?: boolean | null
}

export interface ThreatIndicatorResponse {
  id: number
  indicator_type: IndicatorType
  indicator_value: string
  threat_type: string | null
  confidence: number
  severity: ThreatSeverity
  source: string
  description: string | null
  is_active: boolean
}
