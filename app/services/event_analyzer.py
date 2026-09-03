from app.ai.detection_rules import run_detection_rules
from app.models.analysis_result import AnalysisResult
from app.models.security_event import SecurityEvent


def analyze_event(event: SecurityEvent) -> AnalysisResult:
    """
    Analyze a security event using both baseline risk logic
    and the advanced ThreatLyst detection-rule engine.
    """

    risk_score = 0
    reasons: list[str] = []

    # ---------------------------------------------------------
    # Baseline severity scoring
    # ---------------------------------------------------------

    severity = event.severity.lower()

    if severity == "critical":
        risk_score += 40
        reasons.append("Critical severity event")

    elif severity == "high":
        risk_score += 30
        reasons.append("High severity event")

    elif severity == "medium":
        risk_score += 15
        reasons.append("Medium severity event")

    # ---------------------------------------------------------
    # Baseline event-type scoring
    # ---------------------------------------------------------

    event_type = event.event_type.lower()

    if event_type in {
        "failed_login",
        "brute_force",
        "malware_detected",
    }:
        risk_score += 30
        reasons.append(
            f"Suspicious event type: {event.event_type}"
        )

    # ---------------------------------------------------------
    # Investigation context
    # ---------------------------------------------------------

    if event.source_ip:
        risk_score += 10
        reasons.append(
            "Source IP available for investigation"
        )

    # ---------------------------------------------------------
    # Prepare event for advanced detection
    #
    # raw_data is loaded first so vendor-specific fields such
    # as command_line, failed_attempts, malware_detected, etc.
    # are available to the rule engine.
    #
    # Normalized SecurityEvent fields then overwrite matching
    # raw_data keys so trusted normalized values take priority.
    # ---------------------------------------------------------

    detection_payload = dict(event.raw_data)

    detection_payload.update(
        event.model_dump(
            exclude={"raw_data"},
        )
    )

    # ---------------------------------------------------------
    # Advanced detection rules
    # ---------------------------------------------------------

    detection_matches = run_detection_rules(
        detection_payload
    )

    severity_points = {
        "critical": 35,
        "high": 25,
        "medium": 15,
        "low": 5,
    }

    for match in detection_matches:
        risk_score += severity_points.get(
            match.severity.lower(),
            10,
        )

        reason = (
            f"[{match.rule_id}] "
            f"{match.rule_name} "
            f"(confidence={match.confidence}%)"
        )

        if match.mitre_technique_id:
            reason += (
                f" [MITRE {match.mitre_technique_id}]"
            )

        reasons.append(reason)

    # ---------------------------------------------------------
    # Capture matched rule IDs
    # ---------------------------------------------------------

    matched_rules = [
        match.rule_id
        for match in detection_matches
    ]

    # Prevent scores greater than 100.
    risk_score = min(risk_score, 100)

    # ---------------------------------------------------------
    # Final risk classification
    # ---------------------------------------------------------

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
        matched_rules=matched_rules,
    )