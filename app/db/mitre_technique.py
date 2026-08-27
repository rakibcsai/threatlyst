from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MITRETechniqueDB(Base):
    __tablename__ = "mitre_techniques"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    technique_id: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    tactic: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source: Mapped[str] = mapped_column(
        String(100),
        default="MITRE ATT&CK",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )