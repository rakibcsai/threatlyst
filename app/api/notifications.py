from fastapi import APIRouter, Depends, HTTPException

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.notification_repository import (
    get_notification_by_id,
    get_notifications_for_user,
    mark_notification_as_read,
)
from app.db.user import UserDB

from app.models.notification import NotificationResponse


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def list_notifications(
    limit: int = 100,
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
        safe_limit = max(
            1,
            min(
                limit,
                500,
            ),
        )

        return get_notifications_for_user(
            db=db,
            user_id=current_user.id,
            limit=safe_limit,
        )

    finally:
        db.close()


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_notification(
    notification_id: int,
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
        notification = get_notification_by_id(
            db=db,
            notification_id=notification_id,
        )

        if notification is None:
            raise HTTPException(
                status_code=404,
                detail="Notification not found.",
            )

        if (
            notification.user_id is not None
            and notification.user_id != current_user.id
            and current_user.role != "admin"
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to access this notification."
                ),
            )

        return notification

    finally:
        db.close()


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_as_read(
    notification_id: int,
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
        notification = get_notification_by_id(
            db=db,
            notification_id=notification_id,
        )

        if notification is None:
            raise HTTPException(
                status_code=404,
                detail="Notification not found.",
            )

        if (
            notification.user_id is not None
            and notification.user_id != current_user.id
            and current_user.role != "admin"
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to modify this notification."
                ),
            )

        return mark_notification_as_read(
            db=db,
            notification_id=notification_id,
        )

    finally:
        db.close()