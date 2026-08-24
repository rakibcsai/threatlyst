from app.models.security_event import SecurityEvent


_events: list[SecurityEvent] = []


def save_event(event: SecurityEvent) -> SecurityEvent:
    _events.append(event)
    return event


def get_events() -> list[SecurityEvent]:
    return _events