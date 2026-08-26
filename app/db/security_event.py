from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SecurityEventDB(Base):
    __tablename__ = "security_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    event_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    source_ip: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        index=True,
    )

    destination_ip: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    username: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    hostname: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False,
        index=True,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    raw_data: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )