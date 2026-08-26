from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.db.user import UserDB


bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> UserDB:
    """
    Validate the Bearer JWT and return the
    authenticated ThreatLyst user.
    """

    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        subject = payload.get("sub")

        if subject is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        user_id = int(subject)

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
                detail="Authenticated user does not exist.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="User account is inactive.",
            )

        db.expunge(user)

        return user

    finally:
        db.close()