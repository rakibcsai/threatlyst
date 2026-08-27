from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.threat_indicator import ThreatIndicatorDB
from app.models.threat_indicator import (
    ThreatIndicatorCreate,
    ThreatIndicatorUpdate,
)


def create_threat_indicator(
    db: Session,
    indicator: ThreatIndicatorCreate,
) -> ThreatIndicatorDB:
    """
    Create a new threat intelligence indicator.
    """

    db_indicator = ThreatIndicatorDB(
        indicator_type=indicator.indicator_type,
        indicator_value=indicator.indicator_value.strip(),
        threat_type=(
            indicator.threat_type.strip()
            if indicator.threat_type
            else None
        ),
        confidence=indicator.confidence,
        severity=indicator.severity,
        source=indicator.source.strip(),
        description=(
            indicator.description.strip()
            if indicator.description
            else None
        ),
        is_active=True,
    )

    db.add(db_indicator)
    db.commit()
    db.refresh(db_indicator)

    return db_indicator


def get_threat_indicator_by_id(
    db: Session,
    indicator_id: int,
) -> ThreatIndicatorDB | None:
    """
    Retrieve a threat indicator by ID.
    """

    return (
        db.query(ThreatIndicatorDB)
        .filter(ThreatIndicatorDB.id == indicator_id)
        .first()
    )


def get_threat_indicator_by_value(
    db: Session,
    indicator_value: str,
) -> ThreatIndicatorDB | None:
    """
    Retrieve a threat indicator by its IOC value.
    """

    return (
        db.query(ThreatIndicatorDB)
        .filter(
            ThreatIndicatorDB.indicator_value
            == indicator_value.strip()
        )
        .first()
    )


def get_all_threat_indicators(
    db: Session,
) -> list[ThreatIndicatorDB]:
    """
    Retrieve all threat intelligence indicators.
    """

    return (
        db.query(ThreatIndicatorDB)
        .order_by(
            ThreatIndicatorDB.last_seen_at.desc()
        )
        .all()
    )


def update_threat_indicator(
    db: Session,
    indicator_id: int,
    update: ThreatIndicatorUpdate,
) -> ThreatIndicatorDB | None:
    """
    Update an existing threat indicator.
    """

    db_indicator = get_threat_indicator_by_id(
        db=db,
        indicator_id=indicator_id,
    )

    if db_indicator is None:
        return None

    if update.threat_type is not None:
        db_indicator.threat_type = (
            update.threat_type.strip()
        )

    if update.confidence is not None:
        db_indicator.confidence = update.confidence

    if update.severity is not None:
        db_indicator.severity = update.severity

    if update.description is not None:
        db_indicator.description = (
            update.description.strip()
        )

    if update.is_active is not None:
        db_indicator.is_active = update.is_active

    db_indicator.last_seen_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(db_indicator)

    return db_indicator