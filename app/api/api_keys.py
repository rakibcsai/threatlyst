from fastapi import APIRouter, Depends, HTTPException

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.db.user import UserDB
from app.db.api_key_repository import (
    create_api_key,
    get_all_api_keys,
    revoke_api_key,
)

from app.models.api_key import (
    APIKeyCreate,
    APIKeyCreateResponse,
    APIKeyResponse,
)


router = APIRouter(
    prefix="/api/api-keys",
    tags=["API Keys"],
)


@router.post(
    "",
    response_model=APIKeyCreateResponse,
)
def create_new_api_key(
    request: APIKeyCreate,
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):

    db = SessionLocal()

    try:
        db_api_key, raw_api_key = create_api_key(
            db=db,
            name=request.name,
            created_by_user_id=current_user.id,
        )

        return {
            "id": db_api_key.id,
            "name": db_api_key.name,
            "key_prefix": db_api_key.key_prefix,
            "is_active": db_api_key.is_active,
            "created_by_user_id": (
                db_api_key.created_by_user_id
            ),
            "api_key": raw_api_key,
        }

    finally:
        db.close()


@router.get(
    "",
    response_model=list[APIKeyResponse],
)
def list_api_keys(
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):

    db = SessionLocal()

    try:
        return get_all_api_keys(db)

    finally:
        db.close()


@router.delete(
    "/{api_key_id}",
    response_model=APIKeyResponse,
    responses={
        404: {
            "description": "API key not found",
        }
    },
)
def revoke_existing_api_key(
    api_key_id: int,
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):

    db = SessionLocal()

    try:
        api_key = revoke_api_key(
            db=db,
            api_key_id=api_key_id,
        )

        if api_key is None:
            raise HTTPException(
                status_code=404,
                detail="API key not found.",
            )

        return api_key

    finally:
        db.close()