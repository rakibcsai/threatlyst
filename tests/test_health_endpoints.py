from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.health import router as health_router
from app.api.liveness import router as liveness_router


def create_test_app() -> FastAPI:
    app = FastAPI()
    app.include_router(liveness_router)
    app.include_router(health_router)
    return app


def test_liveness_endpoint_returns_alive():
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/live")

    assert response.status_code == 200

    assert response.json() == {
        "status": "alive",
        "service": "ThreatLyst API",
    }


def test_health_endpoint_returns_healthy():
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "healthy"
    assert body["service"] == "ThreatLyst API"
    assert body["database"] == "healthy"