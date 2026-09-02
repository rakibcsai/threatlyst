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
    # Browser / Host Integration
    # ---------------------------------------------------------

    cors_allowed_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )
    trusted_hosts: str = (
        "127.0.0.1,localhost,testserver"
    )

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

    @staticmethod
    def _comma_separated_values(
        value: str,
    ) -> list[str]:
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    @property
    def cors_origin_list(self) -> list[str]:
        origins = self._comma_separated_values(
            self.cors_allowed_origins
        )
        if "*" in origins:
            raise ValueError(
                "CORS_ALLOWED_ORIGINS cannot contain a wildcard"
            )
        return origins

    @property
    def trusted_host_list(self) -> list[str]:
        return self._comma_separated_values(
            self.trusted_hosts
        )


settings = Settings()
