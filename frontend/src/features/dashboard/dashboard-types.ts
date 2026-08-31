export interface VerdictStats {
  benign: number
  suspicious: number
}

export interface RiskLevelStats {
  critical: number
  high: number
  medium: number
  low: number
}

export interface DashboardStats {
  total_events: number
  verdicts: VerdictStats
  anomalies: number
  risk_levels: RiskLevelStats
  event_types: Record<string, number>
  attack_categories: Record<string, number>
  mitre_techniques: Record<string, number>
}

export interface MetricDatum {
  name: string
  value: number
}
