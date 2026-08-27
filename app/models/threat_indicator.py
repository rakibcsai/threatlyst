from typing import Literal

from pydantic import BaseModel, Field


IndicatorType = Literal[
    "ip",
    "domain",
    "url",
    "file_hash",
    "email",
]


ThreatSeverity = Literal[
    "low",
    "medium",
    "high",
    "critical",
]


class ThreatIndicatorCreate(BaseModel):
    indicator_type: IndicatorType
    indicator_value: str = Field(
        min_length=1,
        max_length=500,
    )
    threat_type: str | None = Field(
        default=None,
        max_length=100,
    )
    confidence: int = Field(
        default=50,
        ge=0,
        le=100,
    )
    severity: ThreatSeverity = "medium"
    source: str = Field(
        min_length=2,
        max_length=255,
    )
    description: str | None = None


class ThreatIndicatorUpdate(BaseModel):
    threat_type: str | None = None
    confidence: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    severity: ThreatSeverity | None = None
    description: str | None = None
    is_active: bool | None = None


class ThreatIndicatorResponse(BaseModel):
    id: int
    indicator_type: IndicatorType
    indicator_value: str
    threat_type: str | None
    confidence: int
    severity: ThreatSeverity
    source: str
    description: str | None
    is_active: bool

    model_config = {
        "from_attributes": True,
    }