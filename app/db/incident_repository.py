from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.incident import IncidentDB
from app.models.incident import (
    IncidentCreate,
    IncidentUpdate,
)


def create_incident(
    db: Session,
    incident: IncidentCreate,
    created_by_user_id: int,
) -> IncidentDB:
    """
    Create a new incident.
    """

    db_incident = IncidentDB(
        title=incident.title.strip(),
        description=incident.description.strip(),
        severity=incident.severity.lower().strip(),
        status="open",
        created_by_user_id=created_by_user_id,
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return db_incident


def get_incident_by_id(
    db: Session,
    incident_id: int,
) -> IncidentDB | None:
    """
    Retrieve an incident by ID.
    """

    return (
        db.query(IncidentDB)
        .filter(IncidentDB.id == incident_id)
        .first()
    )


def get_all_incidents(
    db: Session,
) -> list[IncidentDB]:
    """
    Retrieve all incidents.
    """

    return (
        db.query(IncidentDB)
        .order_by(IncidentDB.created_at.desc())
        .all()
    )


def update_incident(
    db: Session,
    incident_id: int,
    update: IncidentUpdate,
) -> IncidentDB | None:
    """
    Update an incident's status or assignment.
    """

    db_incident = get_incident_by_id(
        db=db,
        incident_id=incident_id,
    )

    if db_incident is None:
        return None

    if update.status is not None:
        db_incident.status = update.status

        if update.status == "closed":
            db_incident.closed_at = datetime.now(
                timezone.utc
            )

        elif db_incident.closed_at is not None:
            db_incident.closed_at = None

    if update.assigned_to_user_id is not None:
        db_incident.assigned_to_user_id = (
            update.assigned_to_user_id
        )

    db.commit()
    db.refresh(db_incident)

    return db_incident