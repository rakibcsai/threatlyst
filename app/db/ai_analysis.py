from sqlalchemy import Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AIAnalysisDB(Base):
    __tablename__ = "ai_analysis_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    event_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey(
            "security_events.event_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    verdict: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    anomaly_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    attack_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    indicators: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    mitre_techniques: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    recommended_actions: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )