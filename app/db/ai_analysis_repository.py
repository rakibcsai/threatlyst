from sqlalchemy.orm import Session

from app.db.ai_analysis import AIAnalysisDB
from app.models.ai_analysis import AIAnalysis


def create_ai_analysis(
    db: Session,
    analysis: AIAnalysis,
    commit: bool = True,
) -> AIAnalysisDB:
    """
    Store an AI analysis result in PostgreSQL.

    When commit=True, the repository commits immediately.

    When commit=False, the result is flushed to the current
    transaction without committing. This allows a higher-level
    service to save related records atomically.
    """

    db_analysis = AIAnalysisDB(
        event_id=analysis.event_id,
        verdict=analysis.verdict,
        confidence=analysis.confidence,
        anomaly_score=analysis.anomaly_score,
        risk_score=analysis.risk_score,
        risk_level=analysis.risk_level,
        explanation=analysis.explanation,
        attack_category=analysis.attack_category,
        indicators=analysis.indicators,
        mitre_techniques=analysis.mitre_techniques,
        recommended_actions=analysis.recommended_actions,
    )

    db.add(db_analysis)

    if commit:
        db.commit()
        db.refresh(db_analysis)
    else:
        db.flush()

    return db_analysis


def get_ai_analysis_by_event_id(
    db: Session,
    event_id: str,
) -> AIAnalysisDB | None:
    """
    Retrieve a stored AI analysis result by event ID.
    """

    return (
        db.query(AIAnalysisDB)
        .filter(AIAnalysisDB.event_id == event_id)
        .first()
    )


def get_all_ai_analysis_results(
    db: Session,
) -> list[AIAnalysisDB]:
    """
    Retrieve all stored AI-analysis results.
    """

    return (
        db.query(AIAnalysisDB)
        .order_by(AIAnalysisDB.id.asc())
        .all()
    )