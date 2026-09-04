from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError

from app.core.auth_dependencies import (
    get_current_session_id,
    get_current_user,
)
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
from app.db.user_session_repository import (
    create_user_session,
    get_user_session_by_session_id,
    mark_session_logged_out,
)

from app.models.auth import LoginRequest, TokenResponse
from app.models.user import UserCreate, UserResponse

from app.services.audit_service import (
    get_client_ip,
    log_user_action,
)
from app.services.auth_service import authenticate_user
from app.services.session_metadata import parse_user_agent


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
    Authenticate a user with dual brute-force protection
    and create a database-backed ThreatLyst session.

    ThreatLyst applies:
    - per IP + account rate limiting
    - per IP rate limiting
    - unique session IDs for every successful login
    - database-backed session tracking
    - browser / OS / device metadata
    - login audit logging

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

        # -----------------------------------------------------
        # Generate a unique session identifier.
        #
        # Every successful login receives its own session,
        # even when multiple people use the same account.
        # -----------------------------------------------------

        session_id = uuid4().hex

        now = datetime.now(timezone.utc)

        expires_at = now + timedelta(
            minutes=(
                settings
                .jwt_access_token_expire_minutes
            )
        )

        # -----------------------------------------------------
        # Capture raw User-Agent and derive browser,
        # operating system, and device information.
        # -----------------------------------------------------

        user_agent = request.headers.get(
            "user-agent"
        )

        session_metadata = parse_user_agent(
            user_agent
        )

        # -----------------------------------------------------
        # Create database session without committing yet.
        # -----------------------------------------------------

        create_user_session(
            db=db,
            session_id=session_id,
            user_id=user_id,
            expires_at=expires_at,
            ip_address=client_ip,
            country=None,
            region=None,
            city=None,
            user_agent=user_agent,
            browser=session_metadata.browser,
            operating_system=(
                session_metadata.operating_system
            ),
            device_type=session_metadata.device_type,
            commit=False,
        )

        # -----------------------------------------------------
        # Create JWT bound to this exact session.
        # -----------------------------------------------------

        access_token = create_access_token(
            subject=str(user_id),
            role=user_role,
            session_id=session_id,
        )

        # -----------------------------------------------------
        # Store successful login audit event in the same
        # database transaction.
        # -----------------------------------------------------

        log_user_action(
            db=db,
            user=user,
            action="login_success",
            resource_type="authentication",
            resource_id=session_id,
            status="success",
            details=(
                "User authenticated successfully and "
                "a new ThreatLyst session was created."
            ),
            request=request,
            commit=False,
        )

        # -----------------------------------------------------
        # Commit session + audit log atomically.
        # -----------------------------------------------------

        db.commit()

        login_rate_limiter.reset(
            account_client_key
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

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@router.post(
    "/logout",
    status_code=204,
)
def logout(
    request: Request,
    session_id: str = Depends(
        get_current_session_id
    ),
):
    """
    Log out only the current ThreatLyst session.

    Other active sessions belonging to the same user
    remain valid.
    """

    db = SessionLocal()

    try:
        session = get_user_session_by_session_id(
            db,
            session_id,
        )

        if session is None:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication session "
                    "does not exist."
                ),
            )

        if session.status in {
            "logged_out",
            "revoked",
            "expired",
        }:
            return

        mark_session_logged_out(
            db=db,
            session=session,
            commit=False,
        )

        user = (
            db.query(UserDB)
            .filter(
                UserDB.id == session.user_id
            )
            .first()
        )

        log_user_action(
            db=db,
            user=user,
            action="logout",
            resource_type="authentication",
            resource_id=session.session_id,
            status="success",
            details=(
                "ThreatLyst session logged out "
                "successfully."
            ),
            request=request,
            commit=False,
        )

        db.commit()

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

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