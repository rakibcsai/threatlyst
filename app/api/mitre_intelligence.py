from fastapi import APIRouter, Depends, HTTPException, Request
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

from app.services.audit_service import log_user_action


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
    request: Request,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    db = SessionLocal()

    try:
        db_technique = create_mitre_technique(
            db=db,
            technique=technique,
        )

        response = MITRETechniqueResponse.model_validate(
            db_technique
        )

        log_user_action(
            db=db,
            user=current_user,
            action="mitre_technique_created",
            resource_type="mitre_technique",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Created MITRE technique "
                f"'{response.technique_id} - {response.name}' "
                f"for tactic '{response.tactic}'."
            ),
            request=request,
        )

        return response

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
    request: Request,
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

        response = MITRETechniqueResponse.model_validate(
            technique
        )

        changed_fields = update.model_dump(
            exclude_unset=True
        )

        log_user_action(
            db=db,
            user=current_user,
            action="mitre_technique_updated",
            resource_type="mitre_technique",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Updated MITRE technique "
                f"'{response.technique_id} - {response.name}'. "
                f"Changes: {changed_fields}"
            ),
            request=request,
        )

        return response

    finally:
        db.close()