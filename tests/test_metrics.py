from app.core.metrics import MetricsRegistry


def test_metrics_registry_records_requests():
    registry = MetricsRegistry()

    registry.record_request(
        path="/health",
        status_code=200,
        duration_ms=10.0,
    )

    registry.record_request(
        path="/api/events",
        status_code=500,
        duration_ms=30.0,
    )

    snapshot = registry.snapshot()

    assert snapshot["total_requests"] == 2
    assert snapshot["total_errors"] == 1
    assert snapshot["average_duration_ms"] == 20.0

    assert snapshot["status_counts"][200] == 1
    assert snapshot["status_counts"][500] == 1

    assert snapshot["path_counts"]["/health"] == 1
    assert snapshot["path_counts"]["/api/events"] == 1


def test_metrics_registry_starts_empty():
    registry = MetricsRegistry()

    snapshot = registry.snapshot()

    assert snapshot["total_requests"] == 0
    assert snapshot["total_errors"] == 0
    assert snapshot["average_duration_ms"] == 0.0
    assert snapshot["status_counts"] == {}
    assert snapshot["path_counts"] == {}