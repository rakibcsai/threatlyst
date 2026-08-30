from types import SimpleNamespace

from app.services.auth_service import authenticate_user


class FakeSession:
    pass


def test_unknown_user_still_verifies_password(
    monkeypatch,
):
    verification_calls = []

    monkeypatch.setattr(
        "app.services.auth_service.get_user_by_email_or_username",
        lambda db, identifier: None,
    )

    def fake_verify_password(
        plain_password,
        hashed_password,
    ):
        verification_calls.append(
            (
                plain_password,
                hashed_password,
            )
        )
        return False

    monkeypatch.setattr(
        "app.services.auth_service.verify_password",
        fake_verify_password,
    )

    result = authenticate_user(
        db=FakeSession(),
        identifier="unknown-user",
        password="wrong-password",
    )

    assert result is None
    assert len(verification_calls) == 1


def test_inactive_user_is_rejected_even_with_valid_password(
    monkeypatch,
):
    user = SimpleNamespace(
        password_hash="stored-hash",
        is_active=False,
    )

    monkeypatch.setattr(
        "app.services.auth_service.get_user_by_email_or_username",
        lambda db, identifier: user,
    )

    monkeypatch.setattr(
        "app.services.auth_service.verify_password",
        lambda plain_password, hashed_password: True,
    )

    result = authenticate_user(
        db=FakeSession(),
        identifier="inactive-user",
        password="correct-password",
    )

    assert result is None