from collections import defaultdict, deque
from threading import Lock
from time import monotonic


MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 60

MAX_IP_LOGIN_ATTEMPTS = 20
IP_LOGIN_WINDOW_SECONDS = 60


class LoginRateLimiter:
    """
    In-memory rate limiter for authentication attempts.

    ThreatLyst uses separate limiter instances for:
    - account-oriented protection
    - source-IP-oriented protection

    This reduces both brute-force attacks against a
    specific account and username-rotation attacks from
    a single source IP.

    A distributed store such as Redis should replace this
    implementation when ThreatLyst runs across multiple
    application instances.
    """

    def __init__(
        self,
        max_attempts: int = MAX_LOGIN_ATTEMPTS,
        window_seconds: int = LOGIN_WINDOW_SECONDS,
    ):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds

        self._attempts: dict[str, deque[float]] = defaultdict(
            deque
        )

        self._lock = Lock()

    def _remove_expired_attempts(
        self,
        attempts: deque[float],
        now: float,
    ) -> None:
        cutoff = now - self.window_seconds

        while attempts and attempts[0] <= cutoff:
            attempts.popleft()

    def is_allowed(
        self,
        client_key: str,
    ) -> bool:
        """
        Return True when another login attempt is allowed.
        """

        now = monotonic()

        with self._lock:
            attempts = self._attempts[client_key]

            self._remove_expired_attempts(
                attempts=attempts,
                now=now,
            )

            return len(attempts) < self.max_attempts

    def record_attempt(
        self,
        client_key: str,
    ) -> None:
        """
        Record a login attempt for the supplied key.
        """

        now = monotonic()

        with self._lock:
            attempts = self._attempts[client_key]

            self._remove_expired_attempts(
                attempts=attempts,
                now=now,
            )

            attempts.append(now)

    def reset(
        self,
        client_key: str,
    ) -> None:
        """
        Clear recorded attempts for the supplied key.
        """

        with self._lock:
            self._attempts.pop(
                client_key,
                None,
            )

    def retry_after_seconds(
        self,
        client_key: str,
    ) -> int:
        """
        Return an approximate number of seconds until the
        key may attempt authentication again.
        """

        now = monotonic()

        with self._lock:
            attempts = self._attempts.get(
                client_key
            )

            if not attempts:
                return 0

            self._remove_expired_attempts(
                attempts=attempts,
                now=now,
            )

            if len(attempts) < self.max_attempts:
                return 0

            remaining = (
                attempts[0]
                + self.window_seconds
                - now
            )

            return max(
                1,
                min(
                    self.window_seconds,
                    int(remaining) + 1,
                ),
            )


login_rate_limiter = LoginRateLimiter()

ip_login_rate_limiter = LoginRateLimiter(
    max_attempts=MAX_IP_LOGIN_ATTEMPTS,
    window_seconds=IP_LOGIN_WINDOW_SECONDS,
)