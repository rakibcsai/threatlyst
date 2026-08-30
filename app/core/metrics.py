from collections import defaultdict
from threading import Lock


class MetricsRegistry:
    """
    Lightweight in-memory application metrics registry.

    This provides basic operational visibility before
    introducing an external monitoring system such as
    Prometheus.
    """

    def __init__(self):
        self._lock = Lock()

        self.total_requests = 0
        self.total_errors = 0
        self.total_duration_ms = 0.0

        self.status_counts: dict[int, int] = defaultdict(int)
        self.path_counts: dict[str, int] = defaultdict(int)

    def record_request(
        self,
        path: str,
        status_code: int,
        duration_ms: float,
    ) -> None:
        with self._lock:
            self.total_requests += 1
            self.total_duration_ms += duration_ms

            self.status_counts[status_code] += 1
            self.path_counts[path] += 1

            if status_code >= 500:
                self.total_errors += 1

    def snapshot(self) -> dict:
        with self._lock:
            average_duration_ms = 0.0

            if self.total_requests > 0:
                average_duration_ms = (
                    self.total_duration_ms
                    / self.total_requests
                )

            return {
                "total_requests": self.total_requests,
                "total_errors": self.total_errors,
                "average_duration_ms": round(
                    average_duration_ms,
                    2,
                ),
                "status_counts": dict(
                    self.status_counts
                ),
                "path_counts": dict(
                    self.path_counts
                ),
            }


metrics_registry = MetricsRegistry()