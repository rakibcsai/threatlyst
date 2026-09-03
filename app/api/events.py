from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.core.rbac import require_roles

from app.models.security_event import SecurityEvent
from app.models.full_event_response import FullEventResponse
from app.models.dashboard_stats import DashboardStats

from app.services.event_store import get_events
from app.services.event_analyzer import analyze_event
from app.services.ai_analyzer import analyze_with_ai
from app.services.dashboard_service import get_dashboard_stats

from app.db.event_repository import create_event
from app.db.analysis_repository import create_analysis_result
from app.db.ai_analysis_repository import create_ai_analysis
from app.db.user import UserDB


router = APIRouter()


@router.post(
    "/api/events",
    response_model=FullEventResponse,
    responses={
        409: {
            "description": "Duplicate event ID",
            "content": {
                "application/json": {
                    "example": {
                        "detail": (
                            "An event with this event_id "
                            "already exists."
                        )
                    }
                }
            },
        }
    },
)
def receive_event(
    event: SecurityEvent,
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
        )
    ),
):

    rule_analysis = analyze_event(event)

    ai_analysis = analyze_with_ai(
        event,
        rule_analysis=rule_analysis,
    )

    db = SessionLocal()

    try:
        create_event(
            db=db,
            event=event,
            commit=False,
        )

        create_analysis_result(
            db=db,
            analysis=rule_analysis,
            commit=False,
        )

        create_ai_analysis(
            db=db,
            analysis=ai_analysis,
            commit=False,
        )

        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "An event with this event_id "
                "already exists."
            ),
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    return {
        "status": "received",
        "event_id": event.event_id,
        "event_type": event.event_type,
        "rule_analysis": rule_analysis,
        "ai_analysis": ai_analysis,
    }


@router.get("/api/events")
def list_events(
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
            "viewer",
        )
    ),
):

    return get_events()


@router.get(
    "/api/dashboard/stats",
    response_model=DashboardStats,
)
def dashboard_stats(
    current_user: UserDB = Depends(
        require_roles(
            "admin",
            "analyst",
            "viewer",
        )
    ),
):

    return get_dashboard_stats()