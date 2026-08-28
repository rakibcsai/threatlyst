from fastapi import APIRouter, Depends, HTTPException

from app.core.database import SessionLocal
from app.core.rbac import require_roles
from app.db.audit_log_repository import (
    get_all_audit_logs,
    get_audit_log_by_id,
)
from app.db.user import UserDB
from app.models.audit_log import AuditLogResponse


router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "",
    response_model=list[AuditLogResponse],
)
def list_audit_logs(
    limit: int = 100,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
        )
    ),
):
    db = SessionLocal()

    try:
        safe_limit = max(
            1,
            min(
                limit,
                500,
            ),
        )

        return get_all_audit_logs(
            db=db,
            limit=safe_limit,
        )

    finally:
        db.close()


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
)
def get_audit_log(
    audit_log_id: int,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
        )
    ),
):
    db = SessionLocal()

    try:
        audit_log = get_audit_log_by_id(
            db=db,
            audit_log_id=audit_log_id,
        )

        if audit_log is None:
            raise HTTPException(
                status_code=404,
                detail="Audit log not found.",
            )

        return audit_log

    finally:
        db.close()