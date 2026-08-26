from collections import Counter

from app.core.database import SessionLocal

from app.db.event_repository import get_all_events
from app.db.analysis_repository import get_all_analysis_results
from app.db.ai_analysis_repository import get_all_ai_analysis_results


def get_dashboard_stats() -> dict:
    """
    Build dashboard statistics from persisted PostgreSQL data.

    Historical rule and AI analysis results are read directly
    from the database instead of recalculating them.
    """

    db = SessionLocal()

    try:
        events = get_all_events(db)
        rule_results = get_all_analysis_results(db)
        ai_results = get_all_ai_analysis_results(db)

        total_events = len(events)

        benign_events = 0
        suspicious_events = 0
        anomalies = 0

        critical_events = 0
        high_risk_events = 0
        medium_risk_events = 0
        low_risk_events = 0

        event_type_counter = Counter()
        attack_category_counter = Counter()
        mitre_technique_counter = Counter()

        for event in events:
            event_type_counter[event.event_type.lower()] += 1

        for result in rule_results:
            risk_level = result.risk_level.lower()

            if risk_level == "critical":
                critical_events += 1
            elif risk_level == "high":
                high_risk_events += 1
            elif risk_level == "medium":
                medium_risk_events += 1
            elif risk_level == "low":
                low_risk_events += 1

        for result in ai_results:
            if result.verdict.lower() == "suspicious":
                suspicious_events += 1
            else:
                benign_events += 1

            if result.anomaly_score < 0:
                anomalies += 1

            attack_category_counter[
                result.attack_category
            ] += 1

            for technique in result.mitre_techniques:
                mitre_technique_counter[technique] += 1

        return {
            "total_events": total_events,
            "verdicts": {
                "benign": benign_events,
                "suspicious": suspicious_events,
            },
            "anomalies": anomalies,
            "risk_levels": {
                "critical": critical_events,
                "high": high_risk_events,
                "medium": medium_risk_events,
                "low": low_risk_events,
            },
            "event_types": dict(event_type_counter),
            "attack_categories": dict(
                attack_category_counter
            ),
            "mitre_techniques": dict(
                mitre_technique_counter
            ),
        }

    finally:
        db.close()