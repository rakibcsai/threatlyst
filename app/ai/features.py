from app.models.security_event import SecurityEvent


def extract_features(event: SecurityEvent) -> list[float]:
    features = [
        1.0 if event.severity.lower() == "critical" else 0.0,
        1.0 if event.severity.lower() == "high" else 0.0,
        1.0 if event.severity.lower() == "medium" else 0.0,
        1.0 if event.source_ip else 0.0,
        1.0 if event.username else 0.0,
        1.0 if event.event_type.lower() == "failed_login" else 0.0,
        1.0 if event.event_type.lower() == "brute_force" else 0.0,
        1.0 if event.event_type.lower() == "malware_detected" else 0.0,
    ]

    return features