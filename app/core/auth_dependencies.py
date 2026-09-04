from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jwt import exceptions as jwt_exceptions

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.db.user import UserDB
from app.db.user_session_repository import (
    get_user_session_by_session_id,
    touch_user_session,
)


bearer_scheme = HTTPBearer()


def _authentication_error(
    detail: str = "Invalid authentication credentials.",
) -> HTTPException:
    """
    Create a consistent HTTP 401 authentication error.
    """

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


def _decode_authenticated_identity(
    token: str,
) -> tuple[int, str]:
    """
    Decode an authenticated ThreatLyst access token.

    Every valid authenticated token must contain:
    - sub: authenticated user ID
    - sid: authenticated session ID
    """

    try:
        payload = decode_access_token(token)

        subject = payload.get("sub")
        session_id = payload.get("sid")

        if subject is None or session_id is None:
            raise _authentication_error()

        try:
            user_id = int(subject)
        except (TypeError, ValueError):
            raise _authentication_error() from None

        if (
            not isinstance(session_id, str)
            or not session_id.strip()
        ):
            raise _authentication_error()

        return user_id, session_id

    except HTTPException:
        raise

    except jwt_exceptions.ExpiredSignatureError:
        raise _authentication_error(
            "Authentication token has expired."
        ) from None

    except jwt_exceptions.PyJWTError:
        raise _authentication_error(
            "Invalid or expired authentication token."
        ) from None


def get_current_session_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> str:
    """
    Return the authenticated ThreatLyst session ID
    contained in the access token.
    """

    _, session_id = _decode_authenticated_identity(
        credentials.credentials
    )

    return session_id


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> UserDB:
    """
    Resolve and validate the currently authenticated user.

    Authentication is valid only when:
    - the JWT is valid,
    - the referenced user exists,
    - the user is active,
    - the JWT contains a valid session ID,
    - the session belongs to the authenticated user,
    - the session has not been revoked,
    - the session has not been logged out,
    - the session has not expired.

    Valid authenticated requests also update the
    session's last-seen timestamp.
    """

    user_id, session_id = _decode_authenticated_identity(
        credentials.credentials
    )

    db = SessionLocal()

    try:
        user = (
            db.query(UserDB)
            .filter(UserDB.id == user_id)
            .first()
        )

        if user is None:
            raise _authentication_error(
                "Authenticated user not found."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        user_session = (
            get_user_session_by_session_id(
                db,
                session_id,
            )
        )

        if user_session is None:
            raise _authentication_error(
                "Authentication session not found."
            )

        if user_session.user_id != user.id:
            raise _authentication_error(
                "Invalid authentication session."
            )

        if (
            user_session.revoked
            or user_session.status == "revoked"
        ):
            raise _authentication_error(
                "Authentication session has been revoked."
            )

        if user_session.status == "logged_out":
            raise _authentication_error(
                "Authentication session has been logged out."
            )

        now = datetime.now(timezone.utc)

        if user_session.expires_at <= now:
            user_session.status = "expired"

            db.commit()

            raise _authentication_error(
                "Authentication session has expired."
            )

        if user_session.status == "expired":
            raise _authentication_error(
                "Authentication session has expired."
            )

        user_session.status = "active"

        touch_user_session(
            db,
            user_session,
            commit=True,
        )

        # touch_user_session() commits the transaction.
        # SQLAlchemy normally expires loaded ORM attributes
        # after a commit.
        #
        # Refresh UserDB while it is still attached to the
        # database session. This prevents FastAPI/Pydantic
        # from raising DetachedInstanceError when serializing
        # fields such as id, username, email, role, and
        # is_active after this database session is closed.
        db.refresh(user)
        db.expunge(user)

        return user

    finally:
        db.close()