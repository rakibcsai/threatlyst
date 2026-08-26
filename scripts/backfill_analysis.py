from app.core.database import SessionLocal

from app.db.event_repository import get_all_events

from app.db.analysis_repository import (
    create_analysis_result,
    get_analysis_by_event_id,
)

from app.db.ai_analysis_repository import (
    create_ai_analysis,
    get_ai_analysis_by_event_id,
)

from app.models.security_event import SecurityEvent

from app.services.event_analyzer import analyze_event
from app.services.ai_analyzer import analyze_with_ai


def backfill_analysis() -> None:
    """
    Backfill missing rule and AI analysis results
    for security events already stored in PostgreSQL.
    """

    db = SessionLocal()

    rule_created = 0
    ai_created = 0

    try:
        db_events = get_all_events(db)

        for db_event in db_events:

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
                raw_data=db_event.raw_data,
            )

            existing_rule = get_analysis_by_event_id(
                db,
                event.event_id,
            )

            if existing_rule is None:
                rule_analysis = analyze_event(event)

                create_analysis_result(
                    db=db,
                    analysis=rule_analysis,
                )

                rule_created += 1

            existing_ai = get_ai_analysis_by_event_id(
                db,
                event.event_id,
            )

            if existing_ai is None:
                ai_analysis = analyze_with_ai(event)

                create_ai_analysis(
                    db=db,
                    analysis=ai_analysis,
                )

                ai_created += 1

        print(
            "Backfill completed successfully."
        )

        print(
            f"Rule analyses created: {rule_created}"
        )

        print(
            f"AI analyses created: {ai_created}"
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    backfill_analysis()