from sqlalchemy.orm import Session

from app.db.audit_log import AuditLogDB


def create_audit_log(
    db: Session,
    *,
    user_id: int | None,
    username: str | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    status: str = "success",
    details: str | None = None,
    ip_address: str | None = None,
    commit: bool = True,
) -> AuditLogDB:
    """
    Create an audit log record.

    When commit=True, commit immediately.

    When commit=False, flush the record into the
    current transaction so a higher-level service
    can commit related changes atomically.
    """

    audit_log = AuditLogDB(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status,
        details=details,
        ip_address=ip_address,
    )

    db.add(audit_log)

    if commit:
        db.commit()
        db.refresh(audit_log)
    else:
        db.flush()

    return audit_log


def get_all_audit_logs(
    db: Session,
    limit: int = 100,
) -> list[AuditLogDB]:
    return (
        db.query(AuditLogDB)
        .order_by(AuditLogDB.created_at.desc())
        .limit(limit)
        .all()
    )


def get_audit_log_by_id(
    db: Session,
    audit_log_id: int,
) -> AuditLogDB | None:
    return (
        db.query(AuditLogDB)
        .filter(AuditLogDB.id == audit_log_id)
        .first()
    )