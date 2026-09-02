from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.core.cors import configure_cors
from app.core.request_size_limit import RequestSizeLimitMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.trusted_hosts import configure_trusted_hosts
from app.core.config import settings


def create_test_app() -> FastAPI:
    app = FastAPI()

    configure_trusted_hosts(app)
    configure_cors(app)
    app.add_middleware(RequestSizeLimitMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/echo")
    async def echo(request: Request):
        body = await request.body()

        return {
            "status": "accepted",
            "size": len(body),
        }

    return app


def test_security_headers_are_present():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/health",
        headers={"host": "localhost"},
    )

    assert response.status_code == 200

    assert (
        response.headers["x-content-type-options"]
        == "nosniff"
    )

    assert (
        response.headers["x-frame-options"]
        == "DENY"
    )

    assert (
        response.headers["referrer-policy"]
        == "no-referrer"
    )

    assert (
        response.headers[
            "cross-origin-opener-policy"
        ]
        == "same-origin"
    )

    assert (
        response.headers[
            "cross-origin-resource-policy"
        ]
        == "same-origin"
    )

    assert (
        response.headers[
            "x-permitted-cross-domain-policies"
        ]
        == "none"
    )

    assert (
        response.headers["cache-control"]
        == "no-store"
    )

    assert (
        "strict-transport-security"
        not in response.headers
    )


def test_trusted_host_accepts_localhost():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/health",
        headers={"host": "localhost"},
    )

    assert response.status_code == 200


def test_trusted_host_rejects_unknown_host():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/health",
        headers={"host": "evil.example.com"},
    )

    assert response.status_code == 400


def test_cors_allows_local_frontend():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/health",
        headers={
            "host": "localhost",
            "origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 200

    assert (
        response.headers[
            "access-control-allow-origin"
        ]
        == "http://localhost:3000"
    )


def test_environment_driven_production_origin_and_host(
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "cors_allowed_origins",
        "https://threatlyst.com,https://www.threatlyst.com",
    )
    monkeypatch.setattr(
        settings,
        "trusted_hosts",
        "api.threatlyst.com,127.0.0.1",
    )

    app = create_test_app()
    client = TestClient(app)
    response = client.get(
        "/health",
        headers={
            "host": "api.threatlyst.com",
            "origin": "https://threatlyst.com",
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://threatlyst.com"
    )


def test_environment_driven_cors_rejects_unlisted_origin(
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "cors_allowed_origins",
        "https://threatlyst.com",
    )

    app = create_test_app()
    client = TestClient(app)
    response = client.get(
        "/health",
        headers={
            "host": "localhost",
            "origin": "https://untrusted.example",
        },
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_cors_configuration_rejects_wildcard(
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "cors_allowed_origins",
        "*",
    )

    try:
        create_test_app()
    except ValueError as error:
        assert "cannot contain a wildcard" in str(error)
    else:
        raise AssertionError(
            "Wildcard CORS configuration was accepted"
        )


def test_request_size_limit_rejects_large_request():
    app = create_test_app()
    client = TestClient(app)

    oversized_length = (
        2 * 1024 * 1024
    ) + 1

    response = client.post(
        "/echo",
        headers={
            "host": "localhost",
            "content-length": str(
                oversized_length
            ),
        },
    )

    assert response.status_code == 413


def test_request_size_limit_rejects_invalid_content_length():
    app = create_test_app()
    client = TestClient(app)

    response = client.post(
        "/echo",
        headers={
            "host": "localhost",
            "content-length": "invalid",
        },
    )

    assert response.status_code == 400


def test_request_size_limit_checks_actual_body_size():
    app = create_test_app()
    client = TestClient(app)

    oversized_body = b"A" * (
        (2 * 1024 * 1024) + 1
    )

    response = client.post(
        "/echo",
        headers={
            "host": "localhost",
        },
        content=oversized_body,
    )

    assert response.status_code == 413
