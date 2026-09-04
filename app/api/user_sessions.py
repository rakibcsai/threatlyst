from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.database import SessionLocal
from app.core.rbac import require_roles
from app.db.user import UserDB
from app.db.user_session import UserSessionDB
from app.db.user_session_repository import (
    get_user_session_by_session_id,
    revoke_user_session,
)
from app.services.audit_service import log_user_action


router = APIRouter(
    prefix="/api/admin/sessions",
    tags=["Admin Sessions"],
)


IDLE_THRESHOLD_MINUTES = 5


def _derive_session_status(
    session: UserSessionDB,
) -> str:
    """
    Derive the current display status for a session.

    Stored terminal states take priority:
    - revoked
    - logged_out
    - expired

    Otherwise an authenticated session is shown as:
    - active: activity within the last 5 minutes
    - idle: no activity for more than 5 minutes
    """

    if session.revoked:
        return "revoked"

    if session.status == "logged_out":
        return "logged_out"

    if session.status == "revoked":
        return "revoked"

    now = datetime.now(timezone.utc)

    if session.expires_at <= now:
        return "expired"

    last_seen = session.last_seen_at or session.login_at

    if (
        last_seen
        and last_seen
        < now - timedelta(
            minutes=IDLE_THRESHOLD_MINUTES
        )
    ):
        return "idle"

    return "active"


def _serialize_session(
    session: UserSessionDB,
    user: UserDB,
) -> dict:
    """
    Convert a ThreatLyst user session into an
    administrator-facing response object.
    """

    location_parts = [
        value
        for value in (
            session.city,
            session.region,
            session.country,
        )
        if value
    ]

    location = (
        ", ".join(location_parts)
        if location_parts
        else None
    )

    return {
        "session_id": session.session_id,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "login_at": session.login_at,
        "last_seen_at": session.last_seen_at,
        "logout_at": session.logout_at,
        "expires_at": session.expires_at,
        "ip_address": session.ip_address,
        "country": session.country,
        "region": session.region,
        "city": session.city,
        "location": location,
        "browser": session.browser,
        "operating_system": (
            session.operating_system
        ),
        "device_type": session.device_type,
        "user_agent": session.user_agent,
        "status": _derive_session_status(
            session
        ),
        "revoked": session.revoked,
    }


@router.get("")
def list_user_sessions(
    _current_user: UserDB = Depends(
        require_roles("admin")
    ),
):
    """
    Return all ThreatLyst login sessions.

    Admins can distinguish multiple simultaneous logins
    even when the same account is being shared.
    """

    db = SessionLocal()

    try:
        rows = (
            db.query(
                UserSessionDB,
                UserDB,
            )
            .join(
                UserDB,
                UserDB.id
                == UserSessionDB.user_id,
            )
            .order_by(
                UserSessionDB.login_at.desc()
            )
            .all()
        )

        return [
            _serialize_session(
                session=session,
                user=user,
            )
            for session, user in rows
        ]

    finally:
        db.close()


@router.post(
    "/{session_id}/revoke",
)
def revoke_session(
    session_id: str,
    request: Request,
    current_user: UserDB = Depends(
        require_roles("admin")
    ),
):
    """
    Revoke one specific ThreatLyst session.

    Other sessions belonging to the same user are
    not affected.
    """

    db = SessionLocal()

    try:
        session = (
            get_user_session_by_session_id(
                db,
                session_id,
            )
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Session not found.",
            )

        if session.revoked:
            return {
                "message": (
                    "Session is already revoked."
                ),
                "session_id": session.session_id,
                "status": "revoked",
            }

        revoke_user_session(
            db=db,
            session=session,
            commit=False,
        )

        log_user_action(
            db=db,
            user=current_user,
            action="session_revoked",
            resource_type="authentication_session",
            resource_id=session.session_id,
            status="success",
            details=(
                "Administrator revoked a "
                "ThreatLyst user session."
            ),
            request=request,
            commit=False,
        )

        db.commit()

        return {
            "message": (
                "Session revoked successfully."
            ),
            "session_id": session.session_id,
            "status": "revoked",
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()