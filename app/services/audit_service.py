from fastapi import Request
from sqlalchemy.orm import Session

from app.db.audit_log import AuditLogDB
from app.db.audit_log_repository import create_audit_log
from app.db.user import UserDB


def get_client_ip(
    request: Request | None,
) -> str | None:
    """
    Extract the client IP address from the request.

    X-Forwarded-For is checked first for reverse-proxy
    deployments. The direct client address is used as
    a fallback.
    """

    if request is None:
        return None

    forwarded_for = request.headers.get(
        "x-forwarded-for"
    )

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None


def log_user_action(
    db: Session,
    *,
    user: UserDB | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    status: str = "success",
    details: str | None = None,
    request: Request | None = None,
) -> AuditLogDB:
    """
    Create an audit record for a user-initiated action.
    """

    return create_audit_log(
        db=db,
        user_id=user.id if user else None,
        username=user.username if user else None,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status,
        details=details,
        ip_address=get_client_ip(request),
    )