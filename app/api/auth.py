from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.exc import IntegrityError

from app.core.auth_dependencies import get_current_user
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.login_rate_limiter import login_rate_limiter
from app.core.rbac import require_roles
from app.core.security import create_access_token

from app.db.user import UserDB
from app.db.user_repository import create_user

from app.models.auth import LoginRequest, TokenResponse
from app.models.user import UserCreate, UserResponse

from app.services.audit_service import get_client_ip, log_user_action
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
    responses={
        429: {
            "description": "Too many login attempts",
        }
    },
)
def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
):

    client_ip = get_client_ip(request) or "unknown"

    client_key = (
        f"{client_ip}:"
        f"{login_data.identifier.strip().lower()}"
    )

    if not login_rate_limiter.is_allowed(
        client_key
    ):
        retry_after = (
            login_rate_limiter.retry_after_seconds(
                client_key
            )
        )

        response.headers["Retry-After"] = str(
            retry_after
        )

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many login attempts. "
                "Please try again later."
            ),
            headers={
                "Retry-After": str(retry_after),
            },
        )

    login_rate_limiter.record_attempt(
        client_key
    )

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

        user_id = user.id
        user_role = user.role

        access_token = create_access_token(
            subject=str(user_id),
            role=user_role,
        )

        login_rate_limiter.reset(
            client_key
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