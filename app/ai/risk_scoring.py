SEVERITY_WEIGHTS = {
    "low": 0.10,
    "medium": 0.30,
    "high": 0.60,
    "critical": 0.90,
}


ANOMALY_RISK_FLOORS = {
    "low": 0.30,
    "medium": 0.40,
    "high": 0.60,
    "critical": 0.80,
}


def calculate_risk_score(
    confidence: float,
    severity: str,
    is_anomaly: bool,
) -> float:
    """
    Calculate a normalized SOC risk score.

    For anomalous events:
    - ML anomaly confidence contributes to the risk score.
    - Event severity contributes operational context.
    - Severity also establishes a minimum operational
      priority for confirmed anomalous activity.

    For normal events:
    - ML confidence is not treated as threat confidence.
    - Only a small severity contribution is retained so
      benign operational activity is not incorrectly elevated.
    """

    normalized_severity = severity.lower().strip()

    severity_weight = SEVERITY_WEIGHTS.get(
        normalized_severity,
        0.10,
    )

    if is_anomaly:
        calculated_score = (
            (confidence * 0.70)
            + (severity_weight * 0.30)
        )

        risk_floor = ANOMALY_RISK_FLOORS.get(
            normalized_severity,
            0.30,
        )

        risk_score = max(
            calculated_score,
            risk_floor,
        )

    else:
        # A normal prediction must not treat ML confidence
        # as threat confidence.
        risk_score = severity_weight * 0.20

    return max(
        0.0,
        min(
            1.0,
            risk_score,
        ),
    )


def classify_risk_level(risk_score: float) -> str:
    """
    Convert a normalized risk score into a SOC priority level.
    """

    if risk_score >= 0.80:
        return "critical"

    if risk_score >= 0.60:
        return "high"

    if risk_score >= 0.30:
        return "medium"

    return "low"