import type { DashboardStats } from '../dashboard/dashboard-types'

export interface SecurityReportSummary {
  report_title: string
  generated_at: string
  generated_by_user_id: number
  generated_by_username: string
  dashboard: DashboardStats
}

export interface SecurityReportResponse {
  report: SecurityReportSummary
}
