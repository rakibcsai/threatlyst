from datetime import datetime, timezone

from pydantic import BaseModel, Field


class SecurityEvent(BaseModel):
    event_id: str
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    source: str
    event_type: str

    source_ip: str | None = None
    destination_ip: str | None = None

    username: str | None = None
    hostname: str | None = None

    severity: str = "medium"

    message: str

    raw_data: dict = Field(default_factory=dict)