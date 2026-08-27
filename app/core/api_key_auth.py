from fastapi import Header, HTTPException

from app.core.database import SessionLocal
from app.db.api_key import APIKeyDB
from app.db.api_key_repository import (
    get_api_key_by_raw_key,
    mark_api_key_used,
)


def get_api_key(
    x_api_key: str | None = Header(
        default=None,
        alias="X-API-Key",
    ),
) -> APIKeyDB:
    """
    Authenticate an external integration using
    the X-API-Key request header.
    """

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key is required.",
        )

    db = SessionLocal()

    try:
        api_key = get_api_key_by_raw_key(
            db=db,
            raw_api_key=x_api_key,
        )

        if api_key is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or inactive API key.",
            )

        mark_api_key_used(
            db=db,
            api_key=api_key,
        )

        db.refresh(api_key)
        db.expunge(api_key)

        return api_key

    finally:
        db.close()