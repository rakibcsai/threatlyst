from app.core.database import SessionLocal
from app.db.ai_analysis_repository import (
    get_ai_analysis_by_event_id,
)
from app.db.analysis_repository import (
    get_analysis_by_event_id,
)
from app.db.event_repository import get_all_events
from app.models.security_event import SecurityEvent
from app.services.ai_analyzer import analyze_with_ai
from app.services.event_analyzer import analyze_event


DEMO_PREFIXES = (
    "DEMO-",
    "PROD-TEST-",
    "PROD-VERIFY-",
)


def rebuild_security_event(db_event) -> SecurityEvent:
    """
    Convert a stored SQLAlchemy security event
    into the Pydantic SecurityEvent model used
    by the ThreatLyst analysis engines.
    """

    return SecurityEvent(
        event_id=db_event.event_id,
        timestamp=db_event.timestamp,
        source=db_event.source,
        event_type=db_event.event_type,
        source_ip=db_event.source_ip,
        destination_ip=db_event.destination_ip,
        username=db_event.username,
        hostname=db_event.hostname,
        severity=db_event.severity,
        message=db_event.message,
        raw_data=db_event.raw_data or {},
    )


def reanalyze_demo_events() -> None:
    """
    Re-run the current ThreatLyst rule and AI engines
    against existing demo/test events.

    Existing rule-analysis and AI-analysis rows are
    updated in place.

    No security events are created or deleted.
    """

    db = SessionLocal()

    try:
        events = [
            event
            for event in get_all_events(db)
            if event.event_id.startswith(DEMO_PREFIXES)
        ]

        print(
            f"Found {len(events)} demo/test events "
            "for historical reanalysis."
        )

        updated_rule_results = 0
        updated_ai_results = 0
        skipped_rule_results = 0
        skipped_ai_results = 0

        for db_event in events:
            event = rebuild_security_event(db_event)

            # -------------------------------------------------
            # Run current rule engine
            # -------------------------------------------------

            rule_analysis = analyze_event(event)

            # -------------------------------------------------
            # Run current hybrid AI analysis
            # -------------------------------------------------

            ai_analysis = analyze_with_ai(
                event,
                rule_analysis=rule_analysis,
            )

            # -------------------------------------------------
            # Update existing stored rule analysis
            # -------------------------------------------------

            stored_rule = get_analysis_by_event_id(
                db,
                event.event_id,
            )

            if stored_rule is not None:
                stored_rule.risk_score = (
                    rule_analysis.risk_score
                )
                stored_rule.risk_level = (
                    rule_analysis.risk_level
                )
                stored_rule.reasons = list(
                    rule_analysis.reasons
                )

                updated_rule_results += 1
            else:
                skipped_rule_results += 1

                print(
                    f"WARNING: No stored rule result for "
                    f"{event.event_id}"
                )

            # -------------------------------------------------
            # Update existing stored AI analysis
            # -------------------------------------------------

            stored_ai = get_ai_analysis_by_event_id(
                db,
                event.event_id,
            )

            if stored_ai is not None:
                stored_ai.verdict = ai_analysis.verdict
                stored_ai.confidence = ai_analysis.confidence
                stored_ai.anomaly_score = (
                    ai_analysis.anomaly_score
                )
                stored_ai.risk_score = (
                    ai_analysis.risk_score
                )
                stored_ai.risk_level = (
                    ai_analysis.risk_level
                )
                stored_ai.explanation = (
                    ai_analysis.explanation
                )
                stored_ai.attack_category = (
                    ai_analysis.attack_category
                )
                stored_ai.indicators = list(
                    ai_analysis.indicators
                )
                stored_ai.mitre_techniques = list(
                    ai_analysis.mitre_techniques
                )
                stored_ai.recommended_actions = list(
                    ai_analysis.recommended_actions
                )

                updated_ai_results += 1
            else:
                skipped_ai_results += 1

                print(
                    f"WARNING: No stored AI result for "
                    f"{event.event_id}"
                )

            print(
                f"{event.event_id}: "
                f"{ai_analysis.verdict} / "
                f"{ai_analysis.risk_level} "
                f"| rules={rule_analysis.matched_rules}"
            )

        # -----------------------------------------------------
        # One atomic commit
        # -----------------------------------------------------

        db.commit()

        print()
        print("Historical reanalysis completed.")
        print(
            f"Rule-analysis rows updated: "
            f"{updated_rule_results}"
        )
        print(
            f"AI-analysis rows updated: "
            f"{updated_ai_results}"
        )
        print(
            f"Rule-analysis rows missing: "
            f"{skipped_rule_results}"
        )
        print(
            f"AI-analysis rows missing: "
            f"{skipped_ai_results}"
        )

    except Exception:
        db.rollback()
        print(
            "Historical reanalysis failed. "
            "Database transaction rolled back."
        )
        raise

    finally:
        db.close()


if __name__ == "__main__":
    reanalyze_demo_events()