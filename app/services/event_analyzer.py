from app.models.security_event import SecurityEvent
from app.models.analysis_result import AnalysisResult


def analyze_event(event: SecurityEvent) -> AnalysisResult:
    risk_score = 0
    reasons = []

    if event.severity.lower() == "critical":
        risk_score += 40
        reasons.append("Critical severity event")

    elif event.severity.lower() == "high":
        risk_score += 30
        reasons.append("High severity event")

    elif event.severity.lower() == "medium":
        risk_score += 15
        reasons.append("Medium severity event")

    if event.event_type.lower() in {
        "failed_login",
        "brute_force",
        "malware_detected",
    }:
        risk_score += 30
        reasons.append(f"Suspicious event type: {event.event_type}")

    if event.source_ip:
        risk_score += 10
        reasons.append("Source IP available for investigation")

    if risk_score >= 70:
        risk_level = "critical"
    elif risk_score >= 50:
        risk_level = "high"
    elif risk_score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return AnalysisResult(
        event_id=event.event_id,
        risk_score=risk_score,
        risk_level=risk_level,
        reasons=reasons,
    )