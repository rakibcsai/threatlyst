from pydantic import BaseModel


class AnalysisResult(BaseModel):
    event_id: str
    risk_score: int
    risk_level: str
    reasons: list[str]