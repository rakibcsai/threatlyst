from pydantic import BaseModel, Field


class AIAnalysis(BaseModel):
    event_id: str

    verdict: str
    confidence: float = Field(ge=0.0, le=1.0)
    anomaly_score: float
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: str

    explanation: str
    attack_category: str
    indicators: list[str]
    mitre_techniques: list[str]
    recommended_actions: list[str]