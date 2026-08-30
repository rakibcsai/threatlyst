from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.db.user import UserDB
from app.db.user_repository import get_user_by_email_or_username


DUMMY_PASSWORD_HASH = hash_password(
    "ThreatLyst-Dummy-Password-For-Timing-Protection"
)


def authenticate_user(
    db: Session,
    identifier: str,
    password: str,
) -> UserDB | None:
    """
    Authenticate a ThreatLyst user using either
    email address or username.

    Password verification is intentionally performed even
    when the account does not exist. This reduces observable
    timing differences that could otherwise assist username
    or email enumeration attacks.

    Returns the user when authentication succeeds.
    Returns None when authentication fails.
    """

    user = get_user_by_email_or_username(
        db=db,
        identifier=identifier,
    )

    password_hash_to_check = (
        user.password_hash
        if user is not None
        else DUMMY_PASSWORD_HASH
    )

    password_valid = verify_password(
        plain_password=password,
        hashed_password=password_hash_to_check,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not password_valid:
        return None

    return user