from app.ai.features import extract_features
from app.ai.model_manager import ml_model_manager
from app.models.security_event import SecurityEvent


def test_event(event: SecurityEvent) -> None:
    features = extract_features(event)
    result = ml_model_manager.predict(features)

    print("=" * 60)
    print("EVENT")
    print("=" * 60)

    print("Event type:", event.event_type)
    print("Severity:", event.severity)
    print("Source IP:", event.source_ip)
    print("Username:", event.username)

    print()
    print("FEATURES")
    print("=" * 60)

    print("Feature count:", len(features))
    print("Features:", features)

    print()
    print("ML RESULT")
    print("=" * 60)

    print("Prediction:", result["prediction"])
    print("Anomaly score:", result["anomaly_score"])


normal_event = SecurityEvent(
    event_id="test-normal-001",
    source="test-system",
    event_type="login",
    source_ip="192.168.1.10",
    username="admin",
    hostname="workstation-01",
    severity="medium",
    message="Successful user login",
    raw_data={
        "status": "success",
        "authentication": "password",
    },
)


suspicious_event = SecurityEvent(
    event_id="test-anomaly-001",
    source="test-system",
    event_type="brute_force",
    source_ip="203.0.113.50",
    destination_ip="192.168.1.10",
    username="admin",
    hostname="server-01",
    severity="critical",
    message="Multiple failed login attempts detected",
    raw_data={
        "attempts": 25,
        "status": "blocked",
        "authentication": "password",
        "source": "external",
    },
)


print("\n\nNORMAL EVENT TEST")
test_event(normal_event)

print("\n\nSUSPICIOUS EVENT TEST")
test_event(suspicious_event)