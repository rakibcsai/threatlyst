from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.notification import NotificationDB
from app.models.notification import NotificationCreate


def create_notification(
    db: Session,
    notification: NotificationCreate,
) -> NotificationDB:
    db_notification = NotificationDB(
        user_id=notification.user_id,
        notification_type=(
            notification.notification_type.strip()
        ),
        title=notification.title.strip(),
        message=notification.message.strip(),
        severity=notification.severity.strip().lower(),
        resource_type=(
            notification.resource_type.strip()
            if notification.resource_type
            else None
        ),
        resource_id=(
            notification.resource_id.strip()
            if notification.resource_id
            else None
        ),
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification


def get_notification_by_id(
    db: Session,
    notification_id: int,
) -> NotificationDB | None:
    return (
        db.query(NotificationDB)
        .filter(NotificationDB.id == notification_id)
        .first()
    )


def get_notifications_for_user(
    db: Session,
    user_id: int,
    limit: int = 100,
) -> list[NotificationDB]:
    return (
        db.query(NotificationDB)
        .filter(
            (NotificationDB.user_id == user_id)
            | (NotificationDB.user_id.is_(None))
        )
        .order_by(NotificationDB.created_at.desc())
        .limit(limit)
        .all()
    )


def mark_notification_as_read(
    db: Session,
    notification_id: int,
) -> NotificationDB | None:
    notification = get_notification_by_id(
        db=db,
        notification_id=notification_id,
    )

    if notification is None:
        return None

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(notification)

    return notification