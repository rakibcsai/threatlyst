from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.database import DATABASE_URL
from app.db.base import Base
from app.db.security_event import SecurityEventDB
from app.db.analysis_result import AnalysisResultDB
from app.db.ai_analysis import AIAnalysisDB
from app.db.user import UserDB
from app.db.api_key import APIKeyDB
from app.db.alert import AlertDB
from app.db.incident import IncidentDB
from app.db.threat_indicator import ThreatIndicatorDB
from app.db.mitre_technique import MITRETechniqueDB
from app.db.audit_log import AuditLogDB
from app.db.notification import NotificationDB

config = context.config


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


database_url = DATABASE_URL.render_as_string(
    hide_password=False
)

config.set_main_option(
    "sqlalchemy.url",
    database_url.replace("%", "%%"),
)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    """

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named",
        },
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    """

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {},
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()