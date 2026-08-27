from fastapi import APIRouter, Depends, HTTPException

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.alert_repository import (
    create_alert,
    get_alert_by_id,
    get_all_alerts,
    update_alert,
)
from app.db.user import UserDB

from app.models.alert import (
    AlertCreate,
    AlertResponse,
    AlertUpdate,
)


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
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        return create_alert(
            db=db,
            alert=alert,
        )

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

        return alert

    finally:
        db.close()