from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import APIRouter, FastAPI
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from app.api import alerts as alerts_api
from app.api import incidents as incidents_api
from app.db import incident_repository
from app.models.incident import IncidentUpdate


CREATED_AT = datetime(
    2026,
    8,
    30,
    9,
    15,
    tzinfo=timezone.utc,
)
UPDATED_AT = datetime(
    2026,
    8,
    31,
    11,
    45,
    tzinfo=timezone.utc,
)
CLOSED_AT = datetime(
    2026,
    8,
    31,
    12,
    30,
    tzinfo=timezone.utc,
)


class FakeSession:
    def commit(self):
        pass

    def refresh(self, record):
        pass

    def close(self):
        pass


def alert_record():
    return SimpleNamespace(
        id=7,
        event_id="evt-4031",
        title="Suspicious authentication burst",
        severity="high",
        status="open",
        description="Repeated authentication failures.",
        assigned_to_user_id=None,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
    )


def incident_record(
    *,
    status="open",
    closed_at=None,
):
    return SimpleNamespace(
        id=12,
        title="Compromised workstation response",
        description="Endpoint containment required.",
        severity="critical",
        status=status,
        assigned_to_user_id=None,
        created_by_user_id=3,
        created_at=CREATED_AT,
        updated_at=UPDATED_AT,
        closed_at=closed_at,
    )


def create_client(
    router: APIRouter,
) -> TestClient:
    app = FastAPI()
    app.include_router(router)

    for route in router.routes:
        if not isinstance(route, APIRoute):
            continue

        for dependency in route.dependant.dependencies:
            app.dependency_overrides[
                dependency.call
            ] = lambda: SimpleNamespace(
                id=1,
                role="admin",
            )

    return TestClient(app)


def assert_timestamp(
    value: str,
    expected: datetime,
):
    parsed = datetime.fromisoformat(
        value.replace("Z", "+00:00")
    )
    assert parsed == expected


def assert_alert_timestamps(payload: dict):
    assert_timestamp(
        payload["created_at"],
        CREATED_AT,
    )
    assert_timestamp(
        payload["updated_at"],
        UPDATED_AT,
    )


def assert_incident_timestamps(
    payload: dict,
    expected_closed_at: datetime | None,
):
    assert_timestamp(
        payload["created_at"],
        CREATED_AT,
    )
    assert_timestamp(
        payload["updated_at"],
        UPDATED_AT,
    )

    if expected_closed_at is None:
        assert payload["closed_at"] is None
    else:
        assert_timestamp(
            payload["closed_at"],
            expected_closed_at,
        )


def configure_alert_api(monkeypatch):
    record = alert_record()
    monkeypatch.setattr(
        alerts_api,
        "SessionLocal",
        FakeSession,
    )
    monkeypatch.setattr(
        alerts_api,
        "get_all_alerts",
        lambda db: [record],
    )
    monkeypatch.setattr(
        alerts_api,
        "get_alert_by_id",
        lambda db, alert_id: record,
    )
    monkeypatch.setattr(
        alerts_api,
        "create_alert",
        lambda db, alert: record,
    )
    monkeypatch.setattr(
        alerts_api,
        "update_alert",
        lambda db, alert_id, update: record,
    )
    monkeypatch.setattr(
        alerts_api,
        "log_user_action",
        lambda **kwargs: None,
    )
    monkeypatch.setattr(
        alerts_api,
        "create_notification",
        lambda **kwargs: None,
    )


def configure_incident_api(
    monkeypatch,
    record=None,
):
    record = record or incident_record()
    monkeypatch.setattr(
        incidents_api,
        "SessionLocal",
        FakeSession,
    )
    monkeypatch.setattr(
        incidents_api,
        "get_all_incidents",
        lambda db: [record],
    )
    monkeypatch.setattr(
        incidents_api,
        "get_incident_by_id",
        lambda db, incident_id: record,
    )
    monkeypatch.setattr(
        incidents_api,
        "create_incident",
        lambda db, incident, created_by_user_id: record,
    )
    monkeypatch.setattr(
        incidents_api,
        "update_incident",
        lambda db, incident_id, update: record,
    )
    monkeypatch.setattr(
        incidents_api,
        "log_user_action",
        lambda **kwargs: None,
    )
    monkeypatch.setattr(
        incidents_api,
        "create_notification",
        lambda **kwargs: None,
    )


def test_alert_list_serializes_timestamps(
    monkeypatch,
):
    configure_alert_api(monkeypatch)
    response = create_client(
        alerts_api.router
    ).get("/api/alerts")

    assert response.status_code == 200
    assert_alert_timestamps(response.json()[0])


def test_alert_detail_serializes_timestamps(
    monkeypatch,
):
    configure_alert_api(monkeypatch)
    response = create_client(
        alerts_api.router
    ).get("/api/alerts/7")

    assert response.status_code == 200
    assert_alert_timestamps(response.json())


def test_alert_create_serializes_timestamps(
    monkeypatch,
):
    configure_alert_api(monkeypatch)
    response = create_client(
        alerts_api.router
    ).post(
        "/api/alerts",
        json={
            "event_id": "evt-4031",
            "title": "Suspicious authentication burst",
            "severity": "high",
            "description": "Repeated authentication failures.",
        },
    )

    assert response.status_code == 200
    assert_alert_timestamps(response.json())


def test_alert_update_serializes_timestamps(
    monkeypatch,
):
    configure_alert_api(monkeypatch)
    response = create_client(
        alerts_api.router
    ).patch(
        "/api/alerts/7",
        json={"status": "investigating"},
    )

    assert response.status_code == 200
    assert_alert_timestamps(response.json())


def test_incident_list_serializes_timestamps(
    monkeypatch,
):
    configure_incident_api(monkeypatch)
    response = create_client(
        incidents_api.router
    ).get("/api/incidents")

    assert response.status_code == 200
    assert_incident_timestamps(
        response.json()[0],
        None,
    )


def test_incident_detail_serializes_timestamps(
    monkeypatch,
):
    configure_incident_api(monkeypatch)
    response = create_client(
        incidents_api.router
    ).get("/api/incidents/12")

    assert response.status_code == 200
    assert_incident_timestamps(
        response.json(),
        None,
    )


def test_incident_create_serializes_timestamps(
    monkeypatch,
):
    configure_incident_api(monkeypatch)
    response = create_client(
        incidents_api.router
    ).post(
        "/api/incidents",
        json={
            "title": "Compromised workstation response",
            "description": "Endpoint containment required.",
            "severity": "critical",
        },
    )

    assert response.status_code == 200
    assert_incident_timestamps(
        response.json(),
        None,
    )


def test_incident_update_serializes_closed_timestamp(
    monkeypatch,
):
    record = incident_record(
        status="closed",
        closed_at=CLOSED_AT,
    )
    configure_incident_api(
        monkeypatch,
        record,
    )
    response = create_client(
        incidents_api.router
    ).patch(
        "/api/incidents/12",
        json={"status": "closed"},
    )

    assert response.status_code == 200
    assert_incident_timestamps(
        response.json(),
        CLOSED_AT,
    )


def test_incident_closed_at_is_set_and_cleared(
    monkeypatch,
):
    record = incident_record()
    monkeypatch.setattr(
        incident_repository,
        "get_incident_by_id",
        lambda db, incident_id: record,
    )
    session = FakeSession()

    closed = incident_repository.update_incident(
        session,
        record.id,
        IncidentUpdate(status="closed"),
    )

    assert closed.closed_at is not None
    assert closed.closed_at.tzinfo is not None

    reopened = incident_repository.update_incident(
        session,
        record.id,
        IncidentUpdate(status="open"),
    )

    assert reopened.closed_at is None
