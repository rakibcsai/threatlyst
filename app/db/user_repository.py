from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.user import UserDB
from app.models.user import UserCreate


def create_user(
    db: Session,
    user: UserCreate,
) -> UserDB:
    """
    Create a new ThreatLyst user with a securely
    hashed password.
    """

    db_user = UserDB(
        email=user.email.lower().strip(),
        username=user.username.strip(),
        password_hash=hash_password(user.password),
        role=user.role.lower().strip(),
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_email(
    db: Session,
    email: str,
) -> UserDB | None:
    """
    Retrieve a user by email address.
    """

    return (
        db.query(UserDB)
        .filter(
            UserDB.email == email.lower().strip()
        )
        .first()
    )


def get_user_by_username(
    db: Session,
    username: str,
) -> UserDB | None:
    """
    Retrieve a user by username.
    """

    return (
        db.query(UserDB)
        .filter(
            UserDB.username == username.strip()
        )
        .first()
    )


def get_user_by_email_or_username(
    db: Session,
    identifier: str,
) -> UserDB | None:
    """
    Retrieve a user using either email
    address or username.
    """

    normalized = identifier.strip()

    return (
        db.query(UserDB)
        .filter(
            or_(
                UserDB.email == normalized.lower(),
                UserDB.username == normalized,
            )
        )
        .first()
    )