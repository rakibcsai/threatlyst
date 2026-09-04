from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import user_sessions as user_sessions_api
from app.core.auth_dependencies import get_current_user
from app.db.user_session import UserSessionDB


def make_user(
    *,
    role: str = "admin",
    user_id: int = 1,
    username: str = "admin_user",
):
    return SimpleNamespace(
        id=user_id,
        username=username,
        email=f"{username}@example.com",
        role=role,
        is_active=True,
    )


def make_session(
    *,
    session_id: str = "session-123",
    user_id: int = 1,
    status: str = "active",
    revoked: bool = False,
    login_at: datetime | None = None,
    last_seen_at: datetime | None = None,
    expires_at: datetime | None = None,
):
    now = datetime.now(timezone.utc)

    return UserSessionDB(
        session_id=session_id,
        user_id=user_id,
        login_at=login_at or now,
        last_seen_at=last_seen_at or now,
        logout_at=None,
        expires_at=expires_at
        or now + timedelta(hours=1),
        ip_address="203.0.113.10",
        country="Malaysia",
        region="Kuala Lumpur",
        city="Kuala Lumpur",
        user_agent="Mozilla/5.0 test",
        browser="Google Chrome",
        operating_system="Windows",
        device_type="Desktop",
        status=status,
        revoked=revoked,
    )


class FakeQuery:
    def __init__(self, rows):
        self.rows = rows

    def join(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def all(self):
        return self.rows


class FakeDB:
    def __init__(self, rows=None):
        self.rows = rows or []
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def query(self, *args, **kwargs):
        return FakeQuery(self.rows)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


def create_test_app(
    user,
) -> FastAPI:
    app = FastAPI()

    app.include_router(
        user_sessions_api.router
    )

    app.dependency_overrides[
        get_current_user
    ] = lambda: user

    return app


def test_active_session_status():
    session = make_session()

    assert (
        user_sessions_api._derive_session_status(
            session
        )
        == "active"
    )


def test_idle_session_status():
    now = datetime.now(timezone.utc)

    session = make_session(
        last_seen_at=(
            now - timedelta(minutes=10)
        ),
    )

    assert (
        user_sessions_api._derive_session_status(
            session
        )
        == "idle"
    )


def test_expired_session_status():
    now = datetime.now(timezone.utc)

    session = make_session(
        expires_at=(
            now - timedelta(minutes=1)
        ),
    )

    assert (
        user_sessions_api._derive_session_status(
            session
        )
        == "expired"
    )


def test_logged_out_status_takes_priority():
    session = make_session(
        status="logged_out",
    )

    assert (
        user_sessions_api._derive_session_status(
            session
        )
        == "logged_out"
    )


def test_revoked_status_takes_priority():
    session = make_session(
        status="active",
        revoked=True,
    )

    assert (
        user_sessions_api._derive_session_status(
            session
        )
        == "revoked"
    )


def test_admin_can_list_user_sessions(
    monkeypatch,
):
    admin = make_user(
        role="admin",
    )

    analyst = make_user(
        role="analyst",
        user_id=2,
        username="demo_analyst",
    )

    first_session = make_session(
        session_id="session-one",
        user_id=2,
    )

    second_session = make_session(
        session_id="session-two",
        user_id=2,
    )

    fake_db = FakeDB(
        rows=[
            (
                first_session,
                analyst,
            ),
            (
                second_session,
                analyst,
            ),
        ]
    )

    monkeypatch.setattr(
        user_sessions_api,
        "SessionLocal",
        lambda: fake_db,
    )

    app = create_test_app(admin)
    client = TestClient(app)

    response = client.get(
        "/api/admin/sessions"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert (
        data[0]["session_id"]
        == "session-one"
    )

    assert (
        data[1]["session_id"]
        == "session-two"
    )

    assert (
        data[0]["username"]
        == "demo_analyst"
    )

    assert (
        data[0]["location"]
        == "Kuala Lumpur, Kuala Lumpur, Malaysia"
    )

    assert (
        data[0]["browser"]
        == "Google Chrome"
    )

    assert (
        data[0]["operating_system"]
        == "Windows"
    )

    assert (
        data[0]["device_type"]
        == "Desktop"
    )

    assert fake_db.closed is True


def test_non_admin_cannot_list_user_sessions():
    analyst = make_user(
        role="analyst",
        username="demo_analyst",
    )

    app = create_test_app(analyst)
    client = TestClient(app)

    response = client.get(
        "/api/admin/sessions"
    )

    assert response.status_code == 403

    assert response.json()["detail"] == (
        "You do not have permission "
        "to access this resource."
    )


def test_admin_can_revoke_one_session(
    monkeypatch,
):
    admin = make_user(
        role="admin",
    )

    session = make_session(
        session_id="session-to-revoke",
        user_id=2,
    )

    fake_db = FakeDB()

    monkeypatch.setattr(
        user_sessions_api,
        "SessionLocal",
        lambda: fake_db,
    )

    monkeypatch.setattr(
        user_sessions_api,
        "get_user_session_by_session_id",
        lambda db, session_id: session,
    )

    def fake_revoke(
        db,
        session,
        commit=True,
    ):
        session.revoked = True
        session.status = "revoked"
        return session

    monkeypatch.setattr(
        user_sessions_api,
        "revoke_user_session",
        fake_revoke,
    )

    monkeypatch.setattr(
        user_sessions_api,
        "log_user_action",
        lambda **kwargs: None,
    )

    app = create_test_app(admin)
    client = TestClient(app)

    response = client.post(
        "/api/admin/sessions/"
        "session-to-revoke/revoke"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["session_id"]
        == "session-to-revoke"
    )

    assert data["status"] == "revoked"

    assert session.revoked is True
    assert session.status == "revoked"

    assert fake_db.committed is True
    assert fake_db.closed is True


def test_revoking_missing_session_returns_404(
    monkeypatch,
):
    admin = make_user(
        role="admin",
    )

    fake_db = FakeDB()

    monkeypatch.setattr(
        user_sessions_api,
        "SessionLocal",
        lambda: fake_db,
    )

    monkeypatch.setattr(
        user_sessions_api,
        "get_user_session_by_session_id",
        lambda db, session_id: None,
    )

    app = create_test_app(admin)
    client = TestClient(app)

    response = client.post(
        "/api/admin/sessions/"
        "missing-session/revoke"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Session not found."
    )

    assert fake_db.closed is True


def test_revoking_already_revoked_session_is_idempotent(
    monkeypatch,
):
    admin = make_user(
        role="admin",
    )

    session = make_session(
        session_id="already-revoked",
        revoked=True,
        status="revoked",
    )

    fake_db = FakeDB()

    monkeypatch.setattr(
        user_sessions_api,
        "SessionLocal",
        lambda: fake_db,
    )

    monkeypatch.setattr(
        user_sessions_api,
        "get_user_session_by_session_id",
        lambda db, session_id: session,
    )

    app = create_test_app(admin)
    client = TestClient(app)

    response = client.post(
        "/api/admin/sessions/"
        "already-revoked/revoke"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["message"]
        == "Session is already revoked."
    )

    assert (
        data["session_id"]
        == "already-revoked"
    )

    assert data["status"] == "revoked"

    assert fake_db.closed is True