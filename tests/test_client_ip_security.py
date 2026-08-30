from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.services.audit_service import get_client_ip


def create_test_app() -> FastAPI:
    app = FastAPI()

    @app.get("/client-ip")
    def client_ip(request: Request):
        return {
            "client_ip": get_client_ip(request),
        }

    return app


def test_client_ip_ignores_spoofed_x_forwarded_for():
    app = create_test_app()
    client = TestClient(app)

    response = client.get(
        "/client-ip",
        headers={
            "x-forwarded-for": "203.0.113.99",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["client_ip"] != "203.0.113.99"
    assert body["client_ip"] is not None