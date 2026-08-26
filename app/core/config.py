from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration for ThreatLyst.

    Sensitive values such as database passwords and JWT secrets
    are loaded from environment variables or the local .env file.
    """

    # ---------------------------------------------------------
    # Application
    # ---------------------------------------------------------

    app_name: str = "ThreatLyst"
    app_version: str = "0.1.0"
    environment: str = "development"

    # ---------------------------------------------------------
    # PostgreSQL Database
    # ---------------------------------------------------------

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "threatlyst"
    db_user: str = "threatlyst_app"
    db_password: str = ""

    # ---------------------------------------------------------
    # Authentication / JWT
    # ---------------------------------------------------------

    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # ---------------------------------------------------------
    # Pydantic Settings
    # ---------------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()