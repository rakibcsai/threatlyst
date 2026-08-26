from fastapi import APIRouter, Depends, HTTPException
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

        return created_user

    except IntegrityError:
        db.rollback()

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
def login(login_data: LoginRequest):

    db = SessionLocal()

    try:
        user = authenticate_user(
            db=db,
            identifier=login_data.identifier,
            password=login_data.password,
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid username/email or password.",
            )

        access_token = create_access_token(
            subject=str(user.id),
            role=user.role,
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