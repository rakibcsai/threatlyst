from datetime import datetime, timezone

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.db.user import UserDB
from app.db.user_session_repository import (
    get_user_session_by_session_id,
    touch_user_session,
)


bearer_scheme = HTTPBearer()


def _decode_authenticated_identity(
    token: str,
) -> tuple[int, str]:
    """
    Decode a ThreatLyst access token and return:

    - authenticated user ID
    - ThreatLyst session ID

    This helper is shared by user and session
    authentication dependencies.
    """

    try:
        payload = decode_access_token(token)

        subject = payload.get("sub")
        session_id = payload.get("sid")

        if subject is None or session_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        user_id = int(subject)

        return user_id, str(session_id)

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired.",
        )

    except (
        InvalidTokenError,
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )


def get_current_session_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> str:
    """
    Return the ThreatLyst session ID associated with
    the current Bearer JWT.

    This dependency is useful for session-specific
    operations such as logout.

    Full session validity is still enforced by the
    database-backed authentication flow where needed.
    """

    token = credentials.credentials

    _, session_id = _decode_authenticated_identity(
        token
    )

    return session_id


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> UserDB:
    """
    Validate the Bearer JWT, confirm that the associated
    ThreatLyst database session is still valid, update
    session activity, and return the authenticated user.
    """

    token = credentials.credentials

    user_id, session_id = (
        _decode_authenticated_identity(token)
    )

    db = SessionLocal()

    try:
        user = (
            db.query(UserDB)
            .filter(UserDB.id == user_id)
            .first()
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authenticated user does not exist."
                ),
            )

        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="User account is inactive.",
            )

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

        if session.user_id != user_id:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication session is invalid."
                ),
            )

        if session.revoked:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication session "
                    "has been revoked."
                ),
            )

        now = datetime.now(timezone.utc)

        if session.expires_at <= now:
            if session.status != "expired":
                session.status = "expired"
                db.commit()

            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication session "
                    "has expired."
                ),
            )

        if session.status in {
            "logged_out",
            "revoked",
            "expired",
        }:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication session "
                    "is no longer active."
                ),
            )

        if session.status != "active":
            session.status = "active"

        touch_user_session(
            db=db,
            session=session,
            commit=True,
        )

        db.expunge(user)

        return user

    finally:
        db.close()