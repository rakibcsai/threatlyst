from datetime import datetime

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    user_id: int | None = None
    notification_type: str = Field(
        min_length=2,
        max_length=100,
    )
    title: str = Field(
        min_length=2,
        max_length=255,
    )
    message: str = Field(
        min_length=2,
    )
    severity: str = "info"
    resource_type: str | None = None
    resource_id: str | None = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int | None
    notification_type: str
    title: str
    message: str
    severity: str
    resource_type: str | None
    resource_id: str | None
    is_read: bool
    created_at: datetime
    read_at: datetime | None

    model_config = {
        "from_attributes": True,
    }