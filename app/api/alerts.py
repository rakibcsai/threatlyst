from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.alert_repository import (
    create_alert,
    get_alert_by_id,
    get_all_alerts,
    update_alert,
)
from app.db.notification_repository import create_notification
from app.db.user import UserDB

from app.models.alert import (
    AlertCreate,
    AlertResponse,
    AlertUpdate,
)
from app.models.notification import NotificationCreate

from app.services.audit_service import log_user_action


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


@router.post(
    "",
    response_model=AlertResponse,
)
def create_new_alert(
    alert: AlertCreate,
    request: Request,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        db_alert = create_alert(
            db=db,
            alert=alert,
        )

        # Materialize the response before additional commits
        # can expire the SQLAlchemy ORM instance.
        response = AlertResponse.model_validate(
            db_alert
        )

        log_user_action(
            db=db,
            user=current_user,
            action="alert_created",
            resource_type="alert",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Created alert '{response.title}' "
                f"with severity '{response.severity}' "
                f"and status '{response.status}'."
            ),
            request=request,
        )

        create_notification(
            db=db,
            notification=NotificationCreate(
                user_id=response.assigned_to_user_id,
                notification_type="alert_created",
                title=f"New Alert: {response.title}",
                message=(
                    f"A {response.severity} severity alert "
                    f"has been created with status "
                    f"'{response.status}'."
                ),
                severity=response.severity,
                resource_type="alert",
                resource_id=str(response.id),
            ),
        )

        return response

    finally:
        db.close()


@router.get(
    "",
    response_model=list[AlertResponse],
)
def list_alerts(
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
            "viewer",
        )
    ),
):

    db = SessionLocal()

    try:
        return get_all_alerts(db)

    finally:
        db.close()


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
def get_alert(
    alert_id: int,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
            "viewer",
        )
    ),
):

    db = SessionLocal()

    try:
        alert = get_alert_by_id(
            db=db,
            alert_id=alert_id,
        )

        if alert is None:
            raise HTTPException(
                status_code=404,
                detail="Alert not found.",
            )

        return alert

    finally:
        db.close()


@router.patch(
    "/{alert_id}",
    response_model=AlertResponse,
)
def modify_alert(
    alert_id: int,
    update: AlertUpdate,
    request: Request,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        alert = update_alert(
            db=db,
            alert_id=alert_id,
            update=update,
        )

        if alert is None:
            raise HTTPException(
                status_code=404,
                detail="Alert not found.",
            )

        # Materialize the response before additional commits.
        response = AlertResponse.model_validate(
            alert
        )

        changed_fields = update.model_dump(
            exclude_unset=True
        )

        log_user_action(
            db=db,
            user=current_user,
            action="alert_updated",
            resource_type="alert",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Updated alert '{response.title}'. "
                f"Changes: {changed_fields}"
            ),
            request=request,
        )

        create_notification(
            db=db,
            notification=NotificationCreate(
                user_id=response.assigned_to_user_id,
                notification_type="alert_updated",
                title=f"Alert Updated: {response.title}",
                message=(
                    f"Alert '{response.title}' was updated. "
                    f"Current status: '{response.status}'. "
                    f"Changes: {changed_fields}"
                ),
                severity=response.severity,
                resource_type="alert",
                resource_id=str(response.id),
            ),
        )

        return response

    finally:
        db.close()