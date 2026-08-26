from sqlalchemy.orm import Session

from app.db.analysis_result import AnalysisResultDB
from app.models.analysis_result import AnalysisResult


def create_analysis_result(
    db: Session,
    analysis: AnalysisResult,
    commit: bool = True,
) -> AnalysisResultDB:
    """
    Store a rule-based analysis result in PostgreSQL.

    When commit=True, the repository commits immediately.

    When commit=False, the result is flushed to the current
    transaction without committing. This allows a higher-level
    service to save related records atomically.
    """

    db_analysis = AnalysisResultDB(
        event_id=analysis.event_id,
        risk_score=analysis.risk_score,
        risk_level=analysis.risk_level,
        reasons=analysis.reasons,
    )

    db.add(db_analysis)

    if commit:
        db.commit()
        db.refresh(db_analysis)
    else:
        db.flush()

    return db_analysis


def get_analysis_by_event_id(
    db: Session,
    event_id: str,
) -> AnalysisResultDB | None:
    """
    Retrieve a stored rule-analysis result
    using the associated event ID.
    """

    return (
        db.query(AnalysisResultDB)
        .filter(AnalysisResultDB.event_id == event_id)
        .first()
    )


def get_all_analysis_results(
    db: Session,
) -> list[AnalysisResultDB]:
    """
    Retrieve all stored rule-analysis results.
    """

    return (
        db.query(AnalysisResultDB)
        .order_by(AnalysisResultDB.id.asc())
        .all()
    )