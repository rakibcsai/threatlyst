export interface SecurityEvent {
  event_id: string
  timestamp: string
  source: string
  event_type: string
  source_ip: string | null
  destination_ip: string | null
  username: string | null
  hostname: string | null
  severity: string
  message: string
  raw_data: Record<string, unknown>
}

export interface EventSubmission {
  event_id: string
  source: string
  event_type: string
  message: string
  timestamp?: string
  source_ip?: string | null
  destination_ip?: string | null
  username?: string | null
  hostname?: string | null
  severity?: string
  raw_data?: Record<string, unknown>
}

export interface RuleAnalysis {
  event_id: string
  risk_score: number
  risk_level: string
  reasons: string[]
}

export interface AIAnalysis {
  event_id: string
  verdict: string
  confidence: number
  anomaly_score: number
  risk_score: number
  risk_level: string
  explanation: string
  attack_category: string
  indicators: string[]
  mitre_techniques: string[]
  recommended_actions: string[]
}

export interface FullEventResponse {
  status: string
  event_id: string
  event_type: string
  rule_analysis: RuleAnalysis
  ai_analysis: AIAnalysis
}
