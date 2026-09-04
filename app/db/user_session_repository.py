from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.user_session import UserSessionDB


def create_user_session(
    db: Session,
    *,
    session_id: str,
    user_id: int,
    expires_at: datetime,
    ip_address: str | None = None,
    country: str | None = None,
    region: str | None = None,
    city: str | None = None,
    user_agent: str | None = None,
    browser: str | None = None,
    operating_system: str | None = None,
    device_type: str | None = None,
    commit: bool = True,
) -> UserSessionDB:
    """
    Create a new authenticated user session.
    """

    now = datetime.now(timezone.utc)

    db_session = UserSessionDB(
        session_id=session_id,
        user_id=user_id,
        login_at=now,
        last_seen_at=now,
        expires_at=expires_at,
        ip_address=ip_address,
        country=country,
        region=region,
        city=city,
        user_agent=user_agent,
        browser=browser,
        operating_system=operating_system,
        device_type=device_type,
        status="active",
        revoked=False,
    )

    db.add(db_session)

    if commit:
        db.commit()
        db.refresh(db_session)
    else:
        db.flush()

    return db_session


def get_user_session_by_session_id(
    db: Session,
    session_id: str,
) -> UserSessionDB | None:
    """
    Retrieve a session by its public session identifier.
    """

    return (
        db.query(UserSessionDB)
        .filter(UserSessionDB.session_id == session_id)
        .first()
    )


def get_sessions_for_user(
    db: Session,
    user_id: int,
) -> list[UserSessionDB]:
    """
    Retrieve all sessions for a user,
    newest login first.
    """

    return (
        db.query(UserSessionDB)
        .filter(UserSessionDB.user_id == user_id)
        .order_by(UserSessionDB.login_at.desc())
        .all()
    )


def get_all_user_sessions(
    db: Session,
) -> list[UserSessionDB]:
    """
    Retrieve all user sessions,
    newest login first.
    """

    return (
        db.query(UserSessionDB)
        .order_by(UserSessionDB.login_at.desc())
        .all()
    )


def touch_user_session(
    db: Session,
    session: UserSessionDB,
    commit: bool = True,
) -> UserSessionDB:
    """
    Update the last activity timestamp for a session.
    """

    session.last_seen_at = datetime.now(timezone.utc)

    if commit:
        db.commit()
        db.refresh(session)
    else:
        db.flush()

    return session


def mark_session_logged_out(
    db: Session,
    session: UserSessionDB,
    commit: bool = True,
) -> UserSessionDB:
    """
    Mark a session as explicitly logged out.
    """

    now = datetime.now(timezone.utc)

    session.status = "logged_out"
    session.logout_at = now
    session.last_seen_at = now

    if commit:
        db.commit()
        db.refresh(session)
    else:
        db.flush()

    return session


def revoke_user_session(
    db: Session,
    session: UserSessionDB,
    commit: bool = True,
) -> UserSessionDB:
    """
    Revoke a user session administratively.
    """

    session.revoked = True
    session.status = "revoked"
    session.last_seen_at = datetime.now(timezone.utc)

    if commit:
        db.commit()
        db.refresh(session)
    else:
        db.flush()

    return session