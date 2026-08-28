from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    username: str | None
    action: str
    resource_type: str
    resource_id: str | None
    status: str
    details: str | None
    ip_address: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }