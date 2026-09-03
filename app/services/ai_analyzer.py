from app.models.security_event import SecurityEvent
from app.models.ai_analysis import AIAnalysis
from app.models.analysis_result import AnalysisResult

from app.ai.features import extract_features
from app.ai.model_manager import ml_model_manager
from app.ai.ml_model import anomaly_score_to_confidence

from app.ai.attack_mapping import (
    ATTACK_MAPPING,
    DEFAULT_ATTACK_MAPPING,
)

from app.ai.risk_scoring import (
    calculate_risk_score,
    classify_risk_level,
)

from app.ai.explanation import build_explanation


def analyze_with_ai(
    event: SecurityEvent,
    rule_analysis: AnalysisResult | None = None,
) -> AIAnalysis:
    """
    Analyze a security event using the ThreatLyst hybrid
    AI detection pipeline.

    Detection signals:
    - Isolation Forest anomaly detection
    - High-confidence detection rules
    - Event severity and operational risk

    A security event can therefore be considered suspicious
    when either the ML model detects anomalous behavior or an
    existing ThreatLyst detection rule identifies a known
    malicious pattern.
    """

    # =========================================================
    # 1. Extract ML features
    # =========================================================

    features = extract_features(event)

    if len(features) != 15:
        raise ValueError(
            f"Expected 15 ML features, got {len(features)}."
        )

    # =========================================================
    # 2. Run ML anomaly detection
    # =========================================================

    ml_result = ml_model_manager.predict(features)

    prediction = ml_result["prediction"]
    anomaly_score = ml_result["anomaly_score"]

    # =========================================================
    # 3. Convert anomaly score to confidence
    # =========================================================

    confidence = anomaly_score_to_confidence(
        anomaly_score
    )

    # =========================================================
    # 4. Determine detection signals
    # =========================================================

    is_ml_anomaly = prediction == "anomaly"

    matched_rules = (
        rule_analysis.matched_rules
        if rule_analysis is not None
        else []
    )

    is_rule_detected = len(matched_rules) > 0

    # A confirmed rule match is also treated as a security
    # detection for operational risk-scoring purposes.
    is_security_detection = (
        is_ml_anomaly
        or is_rule_detected
    )

    # =========================================================
    # 5. Calculate operational risk score
    # =========================================================

    risk_score = calculate_risk_score(
        confidence,
        event.severity,
        is_anomaly=is_security_detection,
    )

    # =========================================================
    # 6. Classify SOC risk level
    # =========================================================

    risk_level = classify_risk_level(
        risk_score
    )

    # =========================================================
    # 7. Collect security indicators
    # =========================================================

    indicators: list[str] = []

    if event.source_ip:
        indicators.append(event.source_ip)

    if event.destination_ip:
        indicators.append(event.destination_ip)

    if event.username:
        indicators.append(event.username)

    if event.hostname:
        indicators.append(event.hostname)

    # =========================================================
    # 8. Determine attack intelligence mapping
    # =========================================================

    event_type = event.event_type.lower().strip()

    attack_info = ATTACK_MAPPING.get(
        event_type,
        DEFAULT_ATTACK_MAPPING,
    )

    attack_category = attack_info[
        "attack_category"
    ]

    # =========================================================
    # 9. Determine final hybrid verdict
    # =========================================================

    is_high_risk = risk_score >= 0.80

    if (
        is_ml_anomaly
        or is_rule_detected
        or is_high_risk
    ):

        verdict = "Suspicious"

        mitre_techniques = attack_info[
            "mitre_techniques"
        ]

        recommended_actions = attack_info[
            "default_actions"
        ]

    else:

        verdict = "Benign"

        attack_category = "Normal Activity"

        mitre_techniques = []

        recommended_actions = [
            "Continue monitoring the event source",
        ]

    # =========================================================
    # 10. Build explainable AI reasoning
    # =========================================================

    explanation = build_explanation(
        prediction=prediction,
        event_type=event_type,
        severity=event.severity,
        confidence=confidence,
        risk_score=risk_score,
        risk_level=risk_level,
        indicators=indicators,
        attack_category=attack_category,
        mitre_techniques=mitre_techniques,
    )

    # Add rule context when the hybrid rule engine contributed
    # to the final verdict.
    if is_rule_detected:
        explanation += (
            " ThreatLyst detection rule(s) matched: "
            + ", ".join(matched_rules)
            + "."
        )

    # =========================================================
    # 11. Return structured AI analysis
    # =========================================================

    return AIAnalysis(
        event_id=event.event_id,
        verdict=verdict,
        confidence=confidence,
        anomaly_score=anomaly_score,
        risk_score=risk_score,
        risk_level=risk_level,
        explanation=explanation,
        attack_category=attack_category,
        indicators=indicators,
        mitre_techniques=mitre_techniques,
        recommended_actions=recommended_actions,
    )