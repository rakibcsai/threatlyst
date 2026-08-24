from pydantic import BaseModel, Field


class AIAnalysis(BaseModel):
    event_id: str

    verdict: str
    confidence: float = Field(ge=0.0, le=1.0)
    anomaly_score: float

    explanation: str

    attack_category: str

    indicators: list[str] = Field(default_factory=list)

    mitre_techniques: list[str] = Field(default_factory=list)

    recommended_actions: list[str] = Field(default_factory=list)