from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import (
    generate_api_key,
    hash_api_key,
)
from app.db.api_key import APIKeyDB


def create_api_key(
    db: Session,
    name: str,
    created_by_user_id: int,
) -> tuple[APIKeyDB, str]:
    """
    Create a new API key.

    The raw API key is returned only once.
    Only its SHA-256 hash is stored in PostgreSQL.
    """

    raw_api_key, key_prefix = generate_api_key()

    db_api_key = APIKeyDB(
        name=name.strip(),
        key_prefix=key_prefix,
        key_hash=hash_api_key(raw_api_key),
        is_active=True,
        created_by_user_id=created_by_user_id,
    )

    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)

    return db_api_key, raw_api_key


def get_api_key_by_raw_key(
    db: Session,
    raw_api_key: str,
) -> APIKeyDB | None:
    """
    Retrieve an active API key using the raw key supplied
    by an external integration.
    """

    hashed_key = hash_api_key(raw_api_key)

    return (
        db.query(APIKeyDB)
        .filter(
            APIKeyDB.key_hash == hashed_key,
            APIKeyDB.is_active.is_(True),
        )
        .first()
    )


def get_api_key_by_id(
    db: Session,
    api_key_id: int,
) -> APIKeyDB | None:
    """
    Retrieve an API key by its database ID.
    """

    return (
        db.query(APIKeyDB)
        .filter(APIKeyDB.id == api_key_id)
        .first()
    )


def get_all_api_keys(
    db: Session,
) -> list[APIKeyDB]:
    """
    Retrieve all API key metadata.

    Raw API keys are never returned because they
    are not stored in plain text.
    """

    return (
        db.query(APIKeyDB)
        .order_by(APIKeyDB.id.asc())
        .all()
    )


def revoke_api_key(
    db: Session,
    api_key_id: int,
) -> APIKeyDB | None:
    """
    Revoke an API key by marking it inactive.

    The key remains in the database for audit/history
    purposes but can no longer authenticate requests.
    """

    api_key = get_api_key_by_id(
        db=db,
        api_key_id=api_key_id,
    )

    if api_key is None:
        return None

    api_key.is_active = False

    db.commit()
    db.refresh(api_key)

    return api_key


def mark_api_key_used(
    db: Session,
    api_key: APIKeyDB,
) -> None:
    """
    Update the API key's last-used timestamp.
    """

    api_key.last_used_at = datetime.now(timezone.utc)

    db.commit()