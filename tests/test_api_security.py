from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.cors import configure_cors
from app.core.request_size_limit import RequestSizeLimitMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.trusted_hosts import configure_trusted_hosts


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
    async def echo():
        return {"status": "accepted"}

    return app


def test_security_headers_are_present():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/health",
        headers={"host": "localhost"},
    )

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cross-origin-opener-policy"] == "same-origin"
    assert response.headers["cross-origin-resource-policy"] == "same-origin"
    assert response.headers["cache-control"] == "no-store"


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
        response.headers["access-control-allow-origin"]
        == "http://localhost:3000"
    )


def test_request_size_limit_rejects_large_request():
    app = create_test_app()
    client = TestClient(app)

    oversized_length = (2 * 1024 * 1024) + 1

    response = client.post(
        "/echo",
        headers={
            "host": "localhost",
            "content-length": str(oversized_length),
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