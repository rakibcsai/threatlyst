from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.threat_indicator_repository import (
    create_threat_indicator,
    get_all_threat_indicators,
    get_threat_indicator_by_id,
    update_threat_indicator,
)
from app.db.user import UserDB

from app.models.threat_indicator import (
    ThreatIndicatorCreate,
    ThreatIndicatorResponse,
    ThreatIndicatorUpdate,
)


router = APIRouter(
    prefix="/api/threat-intelligence",
    tags=["Threat Intelligence"],
)


@router.post(
    "/indicators",
    response_model=ThreatIndicatorResponse,
    responses={
        409: {
            "description": "Duplicate threat indicator",
        }
    },
)
def create_indicator(
    indicator: ThreatIndicatorCreate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        return create_threat_indicator(
            db=db,
            indicator=indicator,
        )

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "A threat indicator with this "
                "indicator_value already exists."
            ),
        )

    finally:
        db.close()


@router.get(
    "/indicators",
    response_model=list[ThreatIndicatorResponse],
)
def list_indicators(
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
        return get_all_threat_indicators(db)

    finally:
        db.close()


@router.get(
    "/indicators/{indicator_id}",
    response_model=ThreatIndicatorResponse,
)
def get_indicator(
    indicator_id: int,
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
        indicator = get_threat_indicator_by_id(
            db=db,
            indicator_id=indicator_id,
        )

        if indicator is None:
            raise HTTPException(
                status_code=404,
                detail="Threat indicator not found.",
            )

        return indicator

    finally:
        db.close()


@router.patch(
    "/indicators/{indicator_id}",
    response_model=ThreatIndicatorResponse,
)
def modify_indicator(
    indicator_id: int,
    update: ThreatIndicatorUpdate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        indicator = update_threat_indicator(
            db=db,
            indicator_id=indicator_id,
            update=update,
        )

        if indicator is None:
            raise HTTPException(
                status_code=404,
                detail="Threat indicator not found.",
            )

        return indicator

    finally:
        db.close()