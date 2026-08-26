from pydantic import BaseModel
from typing import Dict


class VerdictStats(BaseModel):
    benign: int
    suspicious: int


class RiskLevelStats(BaseModel):
    critical: int
    high: int
    medium: int
    low: int


class DashboardStats(BaseModel):
    total_events: int

    verdicts: VerdictStats

    anomalies: int

    risk_levels: RiskLevelStats

    event_types: Dict[str, int]

    attack_categories: Dict[str, int]

    mitre_techniques: Dict[str, int]