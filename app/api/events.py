from fastapi import APIRouter

from app.models.security_event import SecurityEvent
from app.models.full_event_response import FullEventResponse
from app.services.event_store import save_event, get_events
from app.services.event_analyzer import analyze_event
from app.services.ai_analyzer import analyze_with_ai

router = APIRouter()


@router.post("/api/events", response_model=FullEventResponse)
def receive_event(event: SecurityEvent):
    save_event(event)

    rule_analysis = analyze_event(event)
    ai_analysis = analyze_with_ai(event)

    return {
        "status": "received",
        "event_id": event.event_id,
        "event_type": event.event_type,
        "rule_analysis": rule_analysis,
        "ai_analysis": ai_analysis,
    }


@router.get("/api/events")
def list_events():
    return get_events()