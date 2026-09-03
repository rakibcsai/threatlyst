from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.api_key_auth import get_api_key
from app.core.database import SessionLocal

from app.db.ai_analysis_repository import create_ai_analysis
from app.db.analysis_repository import create_analysis_result
from app.db.api_key import APIKeyDB
from app.db.event_repository import create_event

from app.models.full_event_response import FullEventResponse
from app.models.security_event import SecurityEvent

from app.services.ai_analyzer import analyze_with_ai
from app.services.event_analyzer import analyze_event


router = APIRouter(
    prefix="/api/ingest",
    tags=["Event Ingestion"],
)


@router.post(
    "/events",
    response_model=FullEventResponse,
    responses={
        401: {
            "description": "Invalid or missing API key",
        },
        409: {
            "description": "Duplicate event ID",
        },
    },
)
def ingest_event(
    event: SecurityEvent,
    api_key: APIKeyDB = Depends(get_api_key),
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