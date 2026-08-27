from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.mitre_technique_repository import (
    create_mitre_technique,
    get_all_mitre_techniques,
    get_mitre_technique_by_id,
    update_mitre_technique,
)
from app.db.user import UserDB

from app.models.mitre_technique import (
    MITRETechniqueCreate,
    MITRETechniqueResponse,
    MITRETechniqueUpdate,
)


router = APIRouter(
    prefix="/api/mitre",
    tags=["MITRE Intelligence"],
)


@router.post(
    "/techniques",
    response_model=MITRETechniqueResponse,
    responses={
        409: {
            "description": "Duplicate MITRE technique ID",
        }
    },
)
def create_technique(
    technique: MITRETechniqueCreate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        return create_mitre_technique(
            db=db,
            technique=technique,
        )

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "A MITRE technique with this "
                "technique_id already exists."
            ),
        )

    finally:
        db.close()


@router.get(
    "/techniques",
    response_model=list[MITRETechniqueResponse],
)
def list_techniques(
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
        return get_all_mitre_techniques(db)

    finally:
        db.close()


@router.get(
    "/techniques/{technique_db_id}",
    response_model=MITRETechniqueResponse,
)
def get_technique(
    technique_db_id: int,
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
        technique = get_mitre_technique_by_id(
            db=db,
            technique_db_id=technique_db_id,
        )

        if technique is None:
            raise HTTPException(
                status_code=404,
                detail="MITRE technique not found.",
            )

        return technique

    finally:
        db.close()


@router.patch(
    "/techniques/{technique_db_id}",
    response_model=MITRETechniqueResponse,
)
def modify_technique(
    technique_db_id: int,
    update: MITRETechniqueUpdate,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        technique = update_mitre_technique(
            db=db,
            technique_db_id=technique_db_id,
            update=update,
        )

        if technique is None:
            raise HTTPException(
                status_code=404,
                detail="MITRE technique not found.",
            )

        return technique

    finally:
        db.close()