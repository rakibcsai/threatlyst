from app.core.login_rate_limiter import LoginRateLimiter


def test_account_limiter_blocks_repeated_attempts():
    limiter = LoginRateLimiter(
        max_attempts=3,
        window_seconds=60,
    )

    key = "127.0.0.1:user@example.com"

    assert limiter.is_allowed(key) is True

    limiter.record_attempt(key)
    limiter.record_attempt(key)
    limiter.record_attempt(key)

    assert limiter.is_allowed(key) is False


def test_ip_limiter_blocks_username_rotation():
    limiter = LoginRateLimiter(
        max_attempts=4,
        window_seconds=60,
    )

    ip_key = "ip:127.0.0.1"

    usernames = [
        "user1",
        "user2",
        "user3",
        "user4",
    ]

    for _ in usernames:
        limiter.record_attempt(ip_key)

    assert limiter.is_allowed(ip_key) is False


def test_successful_account_reset_does_not_reset_ip_limiter():
    account_limiter = LoginRateLimiter(
        max_attempts=3,
        window_seconds=60,
    )

    ip_limiter = LoginRateLimiter(
        max_attempts=5,
        window_seconds=60,
    )

    account_key = "127.0.0.1:user@example.com"
    ip_key = "ip:127.0.0.1"

    account_limiter.record_attempt(account_key)
    ip_limiter.record_attempt(ip_key)

    account_limiter.reset(account_key)

    assert account_limiter.is_allowed(
        account_key
    ) is True

    assert ip_limiter.retry_after_seconds(
        ip_key
    ) == 0