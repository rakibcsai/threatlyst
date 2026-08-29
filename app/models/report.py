from datetime import datetime

from pydantic import BaseModel

from app.models.dashboard_stats import DashboardStats


class SecurityReportSummary(BaseModel):
    report_title: str
    generated_at: datetime
    generated_by_user_id: int
    generated_by_username: str
    dashboard: DashboardStats


class SecurityReportResponse(BaseModel):
    report: SecurityReportSummary