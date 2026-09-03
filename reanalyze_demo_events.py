from app.core.database import SessionLocal

from app.db.event_repository import get_all_events
from app.db.ai_analysis_repository import get_ai_analysis_by_event_id

from app.models.security_event import SecurityEvent

from app.services.event_analyzer import analyze_event
from app.services.ai_analyzer import analyze_with_ai


DEMO_PREFIXES = (
    "DEMO-",
    "PROD-TEST-",
    "PROD-VERIFY-",
)


def should_reanalyze(event_id: str) -> bool:
    return event_id.startswith(DEMO_PREFIXES)


def main() -> None:
    db = SessionLocal()

    updated = 0
    skipped = 0

    try:
        db_events = get_all_events(db)

        for db_event in db_events:
            if not should_reanalyze(db_event.event_id):
                skipped += 1
                continue

            event = SecurityEvent(
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

            rule_analysis = analyze_event(event)

            ai_analysis = analyze_with_ai(
                event,
                rule_analysis=rule_analysis,
            )

            stored_analysis = get_ai_analysis_by_event_id(
                db,
                event.event_id,
            )

            if stored_analysis is None:
                print(
                    f"SKIP {event.event_id}: "
                    "no stored AI analysis found"
                )
                skipped += 1
                continue

            stored_analysis.verdict = ai_analysis.verdict
            stored_analysis.confidence = ai_analysis.confidence
            stored_analysis.anomaly_score = (
                ai_analysis.anomaly_score
            )
            stored_analysis.risk_score = ai_analysis.risk_score
            stored_analysis.risk_level = ai_analysis.risk_level
            stored_analysis.explanation = ai_analysis.explanation
            stored_analysis.attack_category = (
                ai_analysis.attack_category
            )
            stored_analysis.indicators = ai_analysis.indicators
            stored_analysis.mitre_techniques = (
                ai_analysis.mitre_techniques
            )
            stored_analysis.recommended_actions = (
                ai_analysis.recommended_actions
            )

            updated += 1

            print(
                f"UPDATE {event.event_id}: "
                f"{ai_analysis.verdict} / "
                f"{ai_analysis.risk_level}"
            )

        db.commit()

        print()
        print(f"Updated: {updated}")
        print(f"Skipped: {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()