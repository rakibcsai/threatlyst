import pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.metrics import MetricsRegistry
from app.core.request_logging import RequestLoggingMiddleware


def create_test_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        RequestLoggingMiddleware
    )

    @app.get("/ping")
    def ping():
        return {
            "status": "ok",
        }

    @app.get("/fail")
    def fail():
        raise RuntimeError(
            "Test failure"
        )

    return app


def test_request_id_header_is_added():
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/ping")

    assert response.status_code == 200

    request_id = response.headers.get(
        "x-request-id"
    )

    assert request_id is not None
    assert len(request_id) > 0


def test_request_ids_are_unique():
    app = create_test_app()
    client = TestClient(app)

    first_response = client.get("/ping")
    second_response = client.get("/ping")

    first_request_id = (
        first_response.headers["x-request-id"]
    )

    second_request_id = (
        second_response.headers["x-request-id"]
    )

    assert (
        first_request_id
        != second_request_id
    )


def test_failed_request_records_500_metric(
    monkeypatch,
):
    registry = MetricsRegistry()

    monkeypatch.setattr(
        "app.core.request_logging.metrics_registry",
        registry,
    )

    app = create_test_app()

    client = TestClient(
        app,
        raise_server_exceptions=True,
    )

    with pytest.raises(
        RuntimeError,
        match="Test failure",
    ):
        client.get("/fail")

    snapshot = registry.snapshot()

    assert snapshot["total_requests"] == 1
    assert snapshot["total_errors"] == 1
    assert snapshot["status_counts"][500] == 1
    assert snapshot["path_counts"]["/fail"] == 1