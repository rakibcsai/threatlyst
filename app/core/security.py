from datetime import datetime, timedelta, timezone
import hashlib
import secrets

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using the recommended
    password hashing algorithm.
    """

    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against a stored hash.
    """

    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    role: str,
) -> str:
    """
    Create a signed JWT access token.
    """

    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )

    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    """

    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )


def generate_api_key() -> tuple[str, str]:
    """
    Generate a new ThreatLyst API key.

    Returns:
    - the full raw API key
    - a short prefix used for identification
    """

    secret = secrets.token_urlsafe(32)

    api_key = f"tl_live_{secret}"

    key_prefix = api_key[:16]

    return api_key, key_prefix


def hash_api_key(api_key: str) -> str:
    """
    Create a SHA-256 hash of an API key.

    Only this hash is stored in PostgreSQL.
    """

    return hashlib.sha256(
        api_key.encode("utf-8")
    ).hexdigest()