import pytest

from app.core.login_rate_limiter import LoginRateLimiter
from app.core.security_config import validate_security_configuration
from app.core.config import settings


def test_login_rate_limiter_blocks_after_max_attempts():
    limiter = LoginRateLimiter(
        max_attempts=3,
        window_seconds=60,
    )

    client_key = "127.0.0.1:test-user"

    assert limiter.is_allowed(client_key) is True

    limiter.record_attempt(client_key)
    limiter.record_attempt(client_key)
    limiter.record_attempt(client_key)

    assert limiter.is_allowed(client_key) is False


def test_login_rate_limiter_reset_allows_attempts_again():
    limiter = LoginRateLimiter(
        max_attempts=2,
        window_seconds=60,
    )

    client_key = "127.0.0.1:test-user"

    limiter.record_attempt(client_key)
    limiter.record_attempt(client_key)

    assert limiter.is_allowed(client_key) is False

    limiter.reset(client_key)

    assert limiter.is_allowed(client_key) is True


def test_login_rate_limiter_retry_after_is_positive():
    limiter = LoginRateLimiter(
        max_attempts=1,
        window_seconds=60,
    )

    client_key = "127.0.0.1:test-user"

    limiter.record_attempt(client_key)

    retry_after = limiter.retry_after_seconds(
        client_key
    )

    assert retry_after > 0
    assert retry_after <= 60


def test_security_configuration_accepts_current_settings():
    validate_security_configuration()


def test_security_configuration_rejects_short_jwt_secret(
    monkeypatch,
):
    original_secret = settings.jwt_secret_key

    monkeypatch.setattr(
        settings,
        "jwt_secret_key",
        "short-secret",
    )

    with pytest.raises(
        RuntimeError,
        match=(
            "JWT_SECRET_KEY must contain at least "
            "32 characters."
        ),
    ):
        validate_security_configuration()

    monkeypatch.setattr(
        settings,
        "jwt_secret_key",
        original_secret,
    )


def test_security_configuration_rejects_unsupported_algorithm(
    monkeypatch,
):
    original_algorithm = settings.jwt_algorithm

    monkeypatch.setattr(
        settings,
        "jwt_algorithm",
        "none",
    )

    with pytest.raises(
        RuntimeError,
        match="Unsupported JWT algorithm configured.",
    ):
        validate_security_configuration()

    monkeypatch.setattr(
        settings,
        "jwt_algorithm",
        original_algorithm,
    )