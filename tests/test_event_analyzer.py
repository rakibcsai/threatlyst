from app.models.security_event import SecurityEvent
from app.services.event_analyzer import analyze_event


def test_failed_login_event_becomes_critical():
    event = SecurityEvent(
        event_id="test-analysis-001",
        source="windows",
        event_type="failed_login",
        source_ip="10.0.0.5",
        severity="high",
        message="Repeated failed login attempts",
        raw_data={
            "failed_attempts": 7,
        },
    )

    result = analyze_event(event)

    assert result.event_id == "test-analysis-001"
    assert result.risk_score == 95
    assert result.risk_level == "critical"

    reasons_text = " ".join(result.reasons)

    assert "TL-AUTH-001" in reasons_text
    assert "T1110" in reasons_text


def test_suspicious_powershell_event_is_high_risk():
    event = SecurityEvent(
        event_id="test-analysis-002",
        source="windows",
        event_type="process_execution",
        source_ip="10.0.0.8",
        severity="medium",
        message="PowerShell executed",
        raw_data={
            "command_line": (
                "powershell.exe -enc SQBFAFgA"
            ),
        },
    )

    result = analyze_event(event)

    assert result.risk_score == 50
    assert result.risk_level == "high"

    reasons_text = " ".join(result.reasons)

    assert "TL-EXEC-001" in reasons_text
    assert "T1059.001" in reasons_text


def test_multiple_detection_matches_cap_score_at_100():
    event = SecurityEvent(
        event_id="test-analysis-003",
        source="endpoint",
        event_type="malware_execution",
        source_ip="10.0.0.10",
        severity="critical",
        message="Malware and PowerShell activity",
        raw_data={
            "malware_detected": True,
            "command_line": (
                "powershell.exe -enc SQBFAFgA"
            ),
        },
    )

    result = analyze_event(event)

    assert result.risk_score == 100
    assert result.risk_level == "critical"

    reasons_text = " ".join(result.reasons)

    assert "TL-MAL-001" in reasons_text
    assert "TL-EXEC-001" in reasons_text


def test_low_risk_event_remains_low():
    event = SecurityEvent(
        event_id="test-analysis-004",
        source="application",
        event_type="login_success",
        severity="low",
        message="Successful login",
        raw_data={},
    )

    result = analyze_event(event)

    assert result.risk_score == 0
    assert result.risk_level == "low"