from sqlalchemy.orm import Session

from app.db.security_event import SecurityEventDB
from app.models.security_event import SecurityEvent


def create_event(
    db: Session,
    event: SecurityEvent,
    commit: bool = True,
) -> SecurityEventDB:
    """
    Store a security event in PostgreSQL.

    When commit=True, the repository commits immediately.

    When commit=False, the event is flushed to the current
    transaction without committing. This allows a higher-level
    service to save the event and its analysis results atomically.
    """

    db_event = SecurityEventDB(
        event_id=event.event_id,
        timestamp=event.timestamp,
        source=event.source,
        event_type=event.event_type,
        source_ip=event.source_ip,
        destination_ip=event.destination_ip,
        username=event.username,
        hostname=event.hostname,
        severity=event.severity,
        message=event.message,
        raw_data=event.raw_data,
    )

    db.add(db_event)

    if commit:
        db.commit()
        db.refresh(db_event)
    else:
        db.flush()

    return db_event


def get_all_events(
    db: Session,
) -> list[SecurityEventDB]:
    """
    Retrieve all stored security events from PostgreSQL.
    """

    return (
        db.query(SecurityEventDB)
        .order_by(SecurityEventDB.timestamp.desc())
        .all()
    )