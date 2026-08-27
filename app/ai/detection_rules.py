from dataclasses import dataclass
from typing import Any


@dataclass
class DetectionMatch:
    rule_id: str
    rule_name: str
    severity: str
    confidence: int
    description: str
    mitre_technique_id: str | None = None


def detect_failed_login_burst(
    event: dict[str, Any],
) -> DetectionMatch | None:
    event_type = str(
        event.get("event_type", "")
    ).lower()

    failed_attempts = int(
        event.get("failed_attempts", 0) or 0
    )

    if (
        event_type in {
            "login_failed",
            "failed_login",
            "authentication_failure",
        }
        and failed_attempts >= 5
    ):
        return DetectionMatch(
            rule_id="TL-AUTH-001",
            rule_name="Repeated Failed Login Attempts",
            severity="high",
            confidence=90,
            description=(
                "Multiple failed authentication attempts "
                "were detected and may indicate a brute "
                "force attack."
            ),
            mitre_technique_id="T1110",
        )

    return None


def detect_malware_execution(
    event: dict[str, Any],
) -> DetectionMatch | None:
    event_type = str(
        event.get("event_type", "")
    ).lower()

    malware_detected = bool(
        event.get("malware_detected", False)
    )

    if (
        event_type in {
            "malware_detected",
            "malware_execution",
            "malicious_file",
        }
        or malware_detected
    ):
        return DetectionMatch(
            rule_id="TL-MAL-001",
            rule_name="Potential Malware Execution",
            severity="critical",
            confidence=95,
            description=(
                "The event contains indicators consistent "
                "with possible malware execution."
            ),
            mitre_technique_id="T1204.002",
        )

    return None


def detect_suspicious_powershell(
    event: dict[str, Any],
) -> DetectionMatch | None:
    command_line = str(
        event.get("command_line", "")
    ).lower()

    suspicious_terms = (
        "powershell",
        "-enc",
        "-encodedcommand",
        "invoke-expression",
        "iex",
        "downloadstring",
    )

    matched_terms = [
        term
        for term in suspicious_terms
        if term in command_line
    ]

    if (
        "powershell" in command_line
        and len(matched_terms) >= 2
    ):
        return DetectionMatch(
            rule_id="TL-EXEC-001",
            rule_name="Suspicious PowerShell Execution",
            severity="high",
            confidence=85,
            description=(
                "Suspicious PowerShell command-line "
                "patterns were detected."
            ),
            mitre_technique_id="T1059.001",
        )

    return None


def run_detection_rules(
    event: dict[str, Any],
) -> list[DetectionMatch]:
    detectors = [
        detect_failed_login_burst,
        detect_malware_execution,
        detect_suspicious_powershell,
    ]

    matches: list[DetectionMatch] = []

    for detector in detectors:
        result = detector(event)

        if result is not None:
            matches.append(result)

    return matches