from app.models.security_event import SecurityEvent
from app.models.ai_analysis import AIAnalysis
from app.ai.features import extract_features
from app.ai.model_manager import ml_model_manager
from app.ai.ml_model import anomaly_score_to_confidence


def analyze_with_ai(event: SecurityEvent) -> AIAnalysis:
    """
    AI analysis layer using the ThreatLyst ML anomaly detector.

    The current implementation uses an Isolation Forest model
    trained on the prototype security-event dataset.
    """

    features = extract_features(event)

    ml_result = ml_model_manager.predict(features)

    prediction = ml_result["prediction"]
    anomaly_score = ml_result["anomaly_score"]

    confidence = anomaly_score_to_confidence(anomaly_score)

    indicators = []

    if event.source_ip:
        indicators.append(event.source_ip)

    if event.username:
        indicators.append(event.username)

    if prediction == "anomaly":
        verdict = "Suspicious"
        attack_category = "Potential Credential Access"

        explanation = (
            "The machine-learning model identified the event "
            "as anomalous based on its observed security features."
        )

        recommended_actions = [
            "Investigate the source IP",
            "Review authentication logs",
            "Check the affected user account",
        ]

    else:
        verdict = "Benign"
        attack_category = "No Known Threat"

        explanation = (
            "The machine-learning model did not identify "
            "the event as anomalous based on the current feature set."
        )

        recommended_actions = [
            "Continue monitoring the event source",
        ]

    return AIAnalysis(
        event_id=event.event_id,
        verdict=verdict,
        confidence=confidence,
        anomaly_score=anomaly_score,
        explanation=explanation,
        attack_category=attack_category,
        indicators=indicators,
        mitre_techniques=["T1110"] if prediction == "anomaly" else [],
        recommended_actions=recommended_actions,
    )