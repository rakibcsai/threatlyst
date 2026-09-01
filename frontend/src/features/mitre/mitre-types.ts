export interface MITRETechniqueCreate {
  technique_id: string
  name: string
  tactic: string
  description?: string | null
  source?: string
}
export interface MITRETechniqueUpdate {
  name?: string | null
  tactic?: string | null
  description?: string | null
  source?: string | null
}
export interface MITRETechniqueResponse {
  id: number
  technique_id: string
  name: string
  tactic: string
  description: string | null
  source: string
}
