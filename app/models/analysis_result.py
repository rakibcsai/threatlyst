from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    event_id: str
    risk_score: int
    risk_level: str
    reasons: list[str]

    matched_rules: list[str] = Field(
        default_factory=list
    )