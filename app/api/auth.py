from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError

from app.core.auth_dependencies import get_current_user
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.login_rate_limiter import (
    ip_login_rate_limiter,
    login_rate_limiter,
)
from app.core.rbac import require_roles
from app.core.security import create_access_token

from app.db.user import UserDB
from app.db.user_repository import create_user

from app.models.auth import LoginRequest, TokenResponse
from app.models.user import UserCreate, UserResponse

from app.services.audit_service import (
    get_client_ip,
    log_user_action,
)
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
):
    """
    Authenticate a user with dual brute-force protection.

    ThreatLyst applies:
    - per IP + account rate limiting
    - per IP rate limiting

    Failed authentication attempts are counted by both
    limiters. A successful login resets only the
    account-specific limiter.
    """

    client_ip = (
        get_client_ip(request)
        or "unknown"
    )

    normalized_identifier = (
        login_data.identifier
        .strip()
        .lower()
    )

    account_client_key = (
        f"{client_ip}:"
        f"{normalized_identifier}"
    )

    ip_client_key = (
        f"ip:{client_ip}"
    )

    account_allowed = (
        login_rate_limiter.is_allowed(
            account_client_key
        )
    )

    ip_allowed = (
        ip_login_rate_limiter.is_allowed(
            ip_client_key
        )
    )

    if not account_allowed or not ip_allowed:
        account_retry_after = 0
        ip_retry_after = 0

        if not account_allowed:
            account_retry_after = (
                login_rate_limiter
                .retry_after_seconds(
                    account_client_key
                )
            )

        if not ip_allowed:
            ip_retry_after = (
                ip_login_rate_limiter
                .retry_after_seconds(
                    ip_client_key
                )
            )

        retry_after = max(
            account_retry_after,
            ip_retry_after,
            1,
        )

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many login attempts. "
                "Please try again later."
            ),
            headers={
                "Retry-After": str(
                    retry_after
                ),
            },
        )

    db = SessionLocal()

    try:
        user = authenticate_user(
            db=db,
            identifier=login_data.identifier,
            password=login_data.password,
        )

        if user is None:
            login_rate_limiter.record_attempt(
                account_client_key
            )

            ip_login_rate_limiter.record_attempt(
                ip_client_key
            )

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
                detail=(
                    "Invalid username/email or password."
                ),
            )

        user_id = user.id
        user_role = user.role

        access_token = create_access_token(
            subject=str(user_id),
            role=user_role,
        )

        login_rate_limiter.reset(
            account_client_key
        )

        log_user_action(
            db=db,
            user=user,
            action="login_success",
            resource_type="authentication",
            resource_id=str(user_id),
            status="success",
            details=(
                "User authenticated successfully."
            ),
            request=request,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": (
                settings
                .jwt_access_token_expire_minutes
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