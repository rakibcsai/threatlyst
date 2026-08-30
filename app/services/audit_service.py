from fastapi import Request
from sqlalchemy.orm import Session

from app.db.audit_log import AuditLogDB
from app.db.audit_log_repository import create_audit_log
from app.db.user import UserDB


def get_client_ip(
    request: Request | None,
) -> str | None:
    """
    Return the direct network peer IP address.

    Untrusted proxy headers such as X-Forwarded-For are
    intentionally ignored because clients can spoof them.

    Trusted reverse-proxy support can be enabled later at
    the infrastructure layer when an approved proxy is
    configured.
    """

    if request is None:
        return None

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