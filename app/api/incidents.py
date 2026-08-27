from fastapi import APIRouter, Depends, HTTPException

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.incident_repository import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    update_incident,
)
from app.db.user import UserDB

from app.models.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
)


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"],
)


@router.post(
    "",
    response_model=IncidentResponse,
)
def create_new_incident(
    incident: IncidentCreate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        return create_incident(
            db=db,
            incident=incident,
            created_by_user_id=current_user.id,
        )

    finally:
        db.close()


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def list_incidents(
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
        return get_all_incidents(db)

    finally:
        db.close()


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
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
        incident = get_incident_by_id(
            db=db,
            incident_id=incident_id,
        )

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found.",
            )

        return incident

    finally:
        db.close()


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def modify_incident(
    incident_id: int,
    update: IncidentUpdate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        incident = update_incident(
            db=db,
            incident_id=incident_id,
            update=update,
        )

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found.",
            )

        return incident

    finally:
        db.close()