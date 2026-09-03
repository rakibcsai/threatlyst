from app.models.security_event import SecurityEvent
from app.models.ai_analysis import AIAnalysis

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


def analyze_with_ai(event: SecurityEvent) -> AIAnalysis:
    """
    Analyze a security event using the ThreatLyst AI detection pipeline.

    Pipeline:

        SecurityEvent
            ↓
        Feature extraction
            ↓
        Isolation Forest prediction
            ↓
        ML confidence
            ↓
        Operational risk score
            ↓
        SOC risk classification
            ↓
        MITRE ATT&CK mapping
            ↓
        Recommended response
            ↓
        Explainable AI result

    The ML model determines whether the event is anomalous.
    Operational risk scoring provides additional context based
    on anomaly confidence and event severity.
    """

    # =========================================================
    # 1. Extract ML features
    # =========================================================

    features = extract_features(event)

    # Defensive validation.
    #
    # The current ThreatLyst model uses 15 features. Keeping
    # this validation here helps detect accidental feature
    # changes before they reach the ML model.
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
    # 4. Determine whether ML considers the event anomalous
    # =========================================================

    is_ml_anomaly = prediction == "anomaly"

    # =========================================================
    # 5. Calculate operational risk score
    # =========================================================

    risk_score = calculate_risk_score(
        confidence,
        event.severity,
        is_anomaly=is_ml_anomaly,
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

    attack_category = attack_info["attack_category"]

    # =========================================================
    # 9. Determine verdict
    # =========================================================
    #
    # An ML anomaly is considered suspicious.
    #
    # A very high operational risk score also results in a
    # suspicious verdict even if the ML model itself considers
    # the event normal.
    # =========================================================

    is_high_risk = risk_score >= 0.80

    if is_ml_anomaly or is_high_risk:

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