from typing import Literal

from pydantic import BaseModel, Field


AlertStatus = Literal[
    "open",
    "investigating",
    "resolved",
    "closed",
]


class AlertCreate(BaseModel):
    event_id: str
    title: str = Field(
        min_length=3,
        max_length=255,
    )
    severity: str = Field(
        min_length=3,
        max_length=20,
    )
    description: str = Field(
        min_length=3,
    )


class AlertUpdate(BaseModel):
    status: AlertStatus | None = None
    assigned_to_user_id: int | None = None


class AlertResponse(BaseModel):
    id: int
    event_id: str
    title: str
    severity: str
    status: AlertStatus
    description: str
    assigned_to_user_id: int | None

    model_config = {
        "from_attributes": True,
    }