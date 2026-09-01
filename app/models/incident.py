from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


IncidentStatus = Literal[
    "open",
    "investigating",
    "contained",
    "resolved",
    "closed",
]


class IncidentCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=255,
    )
    description: str = Field(
        min_length=3,
    )
    severity: str = Field(
        min_length=3,
        max_length=20,
    )


class IncidentUpdate(BaseModel):
    status: IncidentStatus | None = None
    assigned_to_user_id: int | None = None


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: IncidentStatus
    assigned_to_user_id: int | None
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None

    model_config = {
        "from_attributes": True,
    }
