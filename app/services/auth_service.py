from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.user import UserDB
from app.db.user_repository import get_user_by_email_or_username


def authenticate_user(
    db: Session,
    identifier: str,
    password: str,
) -> UserDB | None:
    """
    Authenticate a ThreatLyst user using either
    email address or username.

    Returns the user when authentication succeeds.
    Returns None when authentication fails.
    """

    user = get_user_by_email_or_username(
        db=db,
        identifier=identifier,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        plain_password=password,
        hashed_password=user.password_hash,
    ):
        return None

    return user