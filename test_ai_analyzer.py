from app.models.security_event import SecurityEvent
from app.services.ai_analyzer import analyze_with_ai


def print_analysis(title: str, event: SecurityEvent) -> None:
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)

    analysis = analyze_with_ai(event)

    print("Event ID:", analysis.event_id)
    print("Verdict:", analysis.verdict)
    print("Confidence:", round(analysis.confidence, 4))
    print("Anomaly score:", round(analysis.anomaly_score, 6))
    print("Risk score:", round(analysis.risk_score, 4))
    print("Risk level:", analysis.risk_level)
    print("Attack category:", analysis.attack_category)

    print()
    print("Indicators:")
    for indicator in analysis.indicators:
        print(" -", indicator)

    print()
    print("MITRE ATT&CK techniques:")
    for technique in analysis.mitre_techniques:
        print(" -", technique)

    print()
    print("Recommended actions:")
    for action in analysis.recommended_actions:
        print(" -", action)

    print()
    print("Explanation:")
    print(analysis.explanation)


normal_event = SecurityEvent(
    event_id="ai-test-normal-001",
    source="authentication-service",
    event_type="login",
    source_ip="192.168.1.20",
    username="normal_user",
    hostname="workstation-02",
    severity="medium",
    message="Successful user login",
    raw_data={
        "status": "success",
        "authentication": "password",
    },
)


suspicious_event = SecurityEvent(
    event_id="ai-test-anomaly-001",
    source="authentication-service",
    event_type="brute_force",
    source_ip="203.0.113.50",
    destination_ip="192.168.1.20",
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


print_analysis(
    "NORMAL EVENT",
    normal_event,
)

print_analysis(
    "SUSPICIOUS EVENT",
    suspicious_event,
)