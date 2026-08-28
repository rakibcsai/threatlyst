from fastapi import APIRouter, Depends, HTTPException, Request

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

from app.services.audit_service import log_user_action


router = APIRouter(
    prefix="/api/api-keys",
    tags=["API Keys"],
)


@router.post(
    "",
    response_model=APIKeyCreateResponse,
)
def create_new_api_key(
    request_body: APIKeyCreate,
    request: Request,
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):

    db = SessionLocal()

    try:
        db_api_key, raw_api_key = create_api_key(
            db=db,
            name=request_body.name,
            created_by_user_id=current_user.id,
        )

        # Convert the ORM object into a safe response
        # before the audit log performs another commit.
        response = APIKeyCreateResponse(
            id=db_api_key.id,
            name=db_api_key.name,
            key_prefix=db_api_key.key_prefix,
            is_active=db_api_key.is_active,
            created_by_user_id=(
                db_api_key.created_by_user_id
            ),
            api_key=raw_api_key,
        )

        log_user_action(
            db=db,
            user=current_user,
            action="api_key_created",
            resource_type="api_key",
            resource_id=str(db_api_key.id),
            status="success",
            details=(
                f"Created API key '{db_api_key.name}' "
                f"with prefix '{db_api_key.key_prefix}'."
            ),
            request=request,
        )

        return response

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
    request: Request,
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

        # Materialize the response before the audit commit
        # can expire the SQLAlchemy ORM instance.
        response = APIKeyResponse.model_validate(
            api_key
        )

        log_user_action(
            db=db,
            user=current_user,
            action="api_key_revoked",
            resource_type="api_key",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Revoked API key '{response.name}' "
                f"with prefix '{response.key_prefix}'."
            ),
            request=request,
        )

        return response

    finally:
        db.close()