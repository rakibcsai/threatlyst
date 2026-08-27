from sqlalchemy.orm import Session

from app.db.mitre_technique import MITRETechniqueDB
from app.models.mitre_technique import (
    MITRETechniqueCreate,
    MITRETechniqueUpdate,
)


def create_mitre_technique(
    db: Session,
    technique: MITRETechniqueCreate,
) -> MITRETechniqueDB:
    """
    Create a new MITRE ATT&CK technique record.
    """

    db_technique = MITRETechniqueDB(
        technique_id=technique.technique_id.upper().strip(),
        name=technique.name.strip(),
        tactic=technique.tactic.strip(),
        description=(
            technique.description.strip()
            if technique.description
            else None
        ),
        source=technique.source.strip(),
    )

    db.add(db_technique)
    db.commit()
    db.refresh(db_technique)

    return db_technique


def get_mitre_technique_by_id(
    db: Session,
    technique_db_id: int,
) -> MITRETechniqueDB | None:
    """
    Retrieve a MITRE technique by its database ID.
    """

    return (
        db.query(MITRETechniqueDB)
        .filter(
            MITRETechniqueDB.id == technique_db_id
        )
        .first()
    )


def get_mitre_technique_by_technique_id(
    db: Session,
    technique_id: str,
) -> MITRETechniqueDB | None:
    """
    Retrieve a MITRE technique by ATT&CK technique ID.
    """

    return (
        db.query(MITRETechniqueDB)
        .filter(
            MITRETechniqueDB.technique_id
            == technique_id.upper().strip()
        )
        .first()
    )


def get_all_mitre_techniques(
    db: Session,
) -> list[MITRETechniqueDB]:
    """
    Retrieve all MITRE ATT&CK techniques.
    """

    return (
        db.query(MITRETechniqueDB)
        .order_by(
            MITRETechniqueDB.technique_id.asc()
        )
        .all()
    )


def update_mitre_technique(
    db: Session,
    technique_db_id: int,
    update: MITRETechniqueUpdate,
) -> MITRETechniqueDB | None:
    """
    Update an existing MITRE ATT&CK technique.
    """

    db_technique = get_mitre_technique_by_id(
        db=db,
        technique_db_id=technique_db_id,
    )

    if db_technique is None:
        return None

    if update.name is not None:
        db_technique.name = update.name.strip()

    if update.tactic is not None:
        db_technique.tactic = update.tactic.strip()

    if update.description is not None:
        db_technique.description = (
            update.description.strip()
        )

    if update.source is not None:
        db_technique.source = update.source.strip()

    db.commit()
    db.refresh(db_technique)

    return db_technique