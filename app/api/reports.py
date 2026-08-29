from fastapi import APIRouter, Depends, Request

from app.core.database import SessionLocal
from app.core.rbac import require_roles
from app.db.user import UserDB
from app.models.report import SecurityReportResponse
from app.services.audit_service import log_user_action
from app.services.report_service import generate_security_report


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.get(
    "/security-summary",
    response_model=SecurityReportResponse,
)
def get_security_summary_report(
    request: Request,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):
    report = generate_security_report(
        user=current_user,
    )

    db = SessionLocal()

    try:
        log_user_action(
            db=db,
            user=current_user,
            action="security_report_generated",
            resource_type="report",
            resource_id="security-summary",
            status="success",
            details=(
                "Generated ThreatLyst security "
                "summary report."
            ),
            request=request,
        )

    finally:
        db.close()

    return report