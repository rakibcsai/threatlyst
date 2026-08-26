SEVERITY_WEIGHTS = {
    "low": 0.10,
    "medium": 0.30,
    "high": 0.60,
    "critical": 0.90,
}


def calculate_risk_score(
    confidence: float,
    severity: str,
) -> float:
    """
    Combine ML confidence with event severity.

    Returns a normalized risk score between 0.0 and 1.0.
    """

    severity_weight = SEVERITY_WEIGHTS.get(
        severity.lower(),
        0.10,
    )

    risk_score = (
        (confidence * 0.70)
        + (severity_weight * 0.30)
    )

    return max(0.0, min(1.0, risk_score))


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