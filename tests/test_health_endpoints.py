from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.health import router as health_router
from app.api.liveness import router as liveness_router


def create_test_app() -> FastAPI:
    app = FastAPI()
    app.include_router(liveness_router)
    app.include_router(health_router)
    return app


class HealthyDatabaseSession:
    def execute(self, statement):
        return None

    def close(self):
        pass


class UnhealthyDatabaseSession:
    def execute(self, statement):
        raise RuntimeError(
            "Database unavailable"
        )

    def close(self):
        pass


def test_liveness_endpoint_returns_alive():
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/live")

    assert response.status_code == 200

    assert response.json() == {
        "status": "alive",
        "service": "ThreatLyst API",
    }


def test_health_endpoint_returns_healthy(
    monkeypatch,
):
    monkeypatch.setattr(
        "app.api.health.SessionLocal",
        lambda: HealthyDatabaseSession(),
    )

    app = create_test_app()
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "healthy",
        "service": "ThreatLyst API",
        "database": "healthy",
    }


def test_health_endpoint_returns_503_when_database_fails(
    monkeypatch,
):
    monkeypatch.setattr(
        "app.api.health.SessionLocal",
        lambda: UnhealthyDatabaseSession(),
    )

    app = create_test_app()
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 503

    assert response.json() == {
        "status": "unhealthy",
        "service": "ThreatLyst API",
        "database": "unhealthy",
    }