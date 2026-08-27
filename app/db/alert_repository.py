from sqlalchemy.orm import Session

from app.db.alert import AlertDB
from app.models.alert import (
    AlertCreate,
    AlertUpdate,
)


def create_alert(
    db: Session,
    alert: AlertCreate,
) -> AlertDB:
    """
    Create a new alert.
    """

    db_alert = AlertDB(
        event_id=alert.event_id,
        title=alert.title.strip(),
        severity=alert.severity.lower().strip(),
        status="open",
        description=alert.description.strip(),
    )

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return db_alert


def get_alert_by_id(
    db: Session,
    alert_id: int,
) -> AlertDB | None:
    """
    Retrieve an alert by ID.
    """

    return (
        db.query(AlertDB)
        .filter(AlertDB.id == alert_id)
        .first()
    )


def get_all_alerts(
    db: Session,
) -> list[AlertDB]:
    """
    Retrieve all alerts.
    """

    return (
        db.query(AlertDB)
        .order_by(AlertDB.created_at.desc())
        .all()
    )


def update_alert(
    db: Session,
    alert_id: int,
    update: AlertUpdate,
) -> AlertDB | None:
    """
    Update an alert's status or assignment.
    """

    db_alert = get_alert_by_id(
        db=db,
        alert_id=alert_id,
    )

    if db_alert is None:
        return None

    if update.status is not None:
        db_alert.status = update.status

    if update.assigned_to_user_id is not None:
        db_alert.assigned_to_user_id = (
            update.assigned_to_user_id
        )

    db.commit()
    db.refresh(db_alert)

    return db_alert