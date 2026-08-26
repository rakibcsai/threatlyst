from app.core.database import SessionLocal
from app.db.event_repository import (
    create_event,
    get_all_events,
)
from app.models.security_event import SecurityEvent


def save_event(event: SecurityEvent) -> SecurityEvent:
    """
    Persist a security event in PostgreSQL.
    """

    db = SessionLocal()

    try:
        create_event(
            db=db,
            event=event,
        )

        return event

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_events() -> list[SecurityEvent]:
    """
    Retrieve all security events from PostgreSQL
    and convert them into API/domain SecurityEvent models.
    """

    db = SessionLocal()

    try:
        db_events = get_all_events(db)

        return [
            SecurityEvent(
                event_id=db_event.event_id,
                timestamp=db_event.timestamp,
                source=db_event.source,
                event_type=db_event.event_type,
                source_ip=db_event.source_ip,
                destination_ip=db_event.destination_ip,
                username=db_event.username,
                hostname=db_event.hostname,
                severity=db_event.severity,
                message=db_event.message,
                raw_data=db_event.raw_data,
            )
            for db_event in db_events
        ]

    finally:
        db.close()