from app.core.config import settings


def validate_security_configuration() -> None:
    """
    Validate security-sensitive ThreatLyst configuration
    during application startup.

    The application should fail fast rather than operate
    with unsafe authentication settings.
    """

    jwt_secret = settings.jwt_secret_key.strip()

    if not jwt_secret:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured."
        )

    if len(jwt_secret) < 32:
        raise RuntimeError(
            "JWT_SECRET_KEY must contain at least "
            "32 characters."
        )

    allowed_algorithms = {
        "HS256",
        "HS384",
        "HS512",
    }

    if settings.jwt_algorithm not in allowed_algorithms:
        raise RuntimeError(
            "Unsupported JWT algorithm configured."
        )