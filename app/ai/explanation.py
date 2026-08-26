def build_explanation(
    prediction: str,
    event_type: str,
    severity: str,
    confidence: float,
    risk_score: float,
    risk_level: str,
    indicators: list[str],
    attack_category: str,
    mitre_techniques: list[str],
) -> str:
    """
    Build a human-readable explanation for the AI analysis.

    The explanation combines ML assessment, event severity,
    operational risk, security context, and available indicators.
    """

    parts = []

    # ---------------------------------------------------------
    # ML assessment
    # ---------------------------------------------------------

    if prediction == "anomaly":
        parts.append(
            "The machine-learning model identified "
            "the event as anomalous."
        )
    else:
        parts.append(
            "The machine-learning model did not identify "
            "the event as anomalous."
        )

    # ---------------------------------------------------------
    # Event context
    # ---------------------------------------------------------

    parts.append(
        f"Event type: {event_type}."
    )

    parts.append(
        f"Event severity: {severity.lower()}."
    )

    # ---------------------------------------------------------
    # ML confidence
    # ---------------------------------------------------------

    parts.append(
        f"ML confidence: {confidence:.2f}."
    )

    # ---------------------------------------------------------
    # Operational risk
    # ---------------------------------------------------------

    parts.append(
        f"Operational risk score: {risk_score:.2f} "
        f"({risk_level})."
    )

    # ---------------------------------------------------------
    # Attack context
    # ---------------------------------------------------------

    parts.append(
        f"Security category: {attack_category}."
    )

    if mitre_techniques:
        techniques = ", ".join(mitre_techniques)

        parts.append(
            f"Associated MITRE ATT&CK technique(s): "
            f"{techniques}."
        )

    # ---------------------------------------------------------
    # Indicators
    # ---------------------------------------------------------

    if indicators:
        parts.append(
            f"{len(indicators)} security indicator(s) "
            "are available for investigation."
        )

    return " ".join(parts)