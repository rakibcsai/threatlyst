from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError

from app.core.auth_dependencies import get_current_user
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.rbac import require_roles
from app.core.security import create_access_token

from app.db.user import UserDB
from app.db.user_repository import create_user

from app.models.auth import LoginRequest, TokenResponse
from app.models.user import UserCreate, UserResponse

from app.services.audit_service import log_user_action
from app.services.auth_service import authenticate_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    responses={
        403: {
            "description": "Insufficient permissions",
            "content": {
                "application/json": {
                    "example": {
                        "detail": (
                            "You do not have permission "
                            "to access this resource."
                        )
                    }
                }
            },
        },
        409: {
            "description": "Duplicate user",
            "content": {
                "application/json": {
                    "example": {
                        "detail": (
                            "A user with this email or username "
                            "already exists."
                        )
                    }
                }
            },
        },
    },
)
def register_user(
    user: UserCreate,
    request: Request,
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):

    db = SessionLocal()

    try:
        created_user = create_user(
            db=db,
            user=user,
        )

        # Materialize the response before the audit-log
        # commit can expire the ORM instance.
        response = UserResponse.model_validate(
            created_user
        )

        log_user_action(
            db=db,
            user=current_user,
            action="user_created",
            resource_type="user",
            resource_id=str(response.id),
            status="success",
            details=(
                f"Created user '{response.username}' "
                f"with role '{response.role}'."
            ),
            request=request,
        )

        return response

    except IntegrityError:
        db.rollback()

        log_user_action(
            db=db,
            user=current_user,
            action="user_creation_failed",
            resource_type="user",
            resource_id=None,
            status="failed",
            details=(
                f"User creation failed because username "
                f"'{user.username}' or email '{user.email}' "
                f"already exists."
            ),
            request=request,
        )

        raise HTTPException(
            status_code=409,
            detail=(
                "A user with this email or username "
                "already exists."
            ),
        )

    finally:
        db.close()


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    login_data: LoginRequest,
    request: Request,
):

    db = SessionLocal()

    try:
        user = authenticate_user(
            db=db,
            identifier=login_data.identifier,
            password=login_data.password,
        )

        if user is None:
            log_user_action(
                db=db,
                user=None,
                action="login_failed",
                resource_type="authentication",
                resource_id=None,
                status="failed",
                details=(
                    "Failed login attempt for identifier "
                    f"'{login_data.identifier}'."
                ),
                request=request,
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid username/email or password.",
            )

        # Capture primitive values before the audit commit.
        user_id = user.id
        user_role = user.role

        access_token = create_access_token(
            subject=str(user_id),
            role=user_role,
        )

        log_user_action(
            db=db,
            user=user,
            action="login_success",
            resource_type="authentication",
            resource_id=str(user_id),
            status="success",
            details="User authenticated successfully.",
            request=request,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": (
                settings.jwt_access_token_expire_minutes
                * 60
            ),
        }

    finally:
        db.close()


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: UserDB = Depends(
        get_current_user
    ),
):

    return current_user