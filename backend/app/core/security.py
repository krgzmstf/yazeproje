"""
Security utilities: JWT token creation/verification and password hashing.
Uses python-jose for JWT and passlib[bcrypt] for password hashing.
"""

import hashlib
import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# ── Password Hashing ────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a PBKDF2-HMAC-SHA256 hash."""
    try:
        salt_hex, key_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False


# ── JWT Tokens ───────────────────────────────────────────────────
def create_access_token(
    subject: str | int,
    extra_claims: dict | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(
    subject: str | int,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT refresh token."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta
        else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode: dict = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Raises jose.JWTError on invalid/expired tokens.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
