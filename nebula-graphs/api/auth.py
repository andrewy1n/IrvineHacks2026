"""Simple JWT auth utilities for Nebula MVP."""
import os
import hashlib
import hmac
import json
import base64
import time
from typing import Optional
from fastapi import HTTPException, Depends, Header

SECRET_KEY = os.getenv("JWT_SECRET", "nebula-dev-secret-change-in-prod")
TOKEN_EXPIRY = 86400 * 7  # 7 days


def hash_password(password: str) -> str:
    """Simple SHA-256 hash for MVP. Use bcrypt in production."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def create_token(user_id: str, email: str) -> str:
    """Create a simple JWT-like token (base64 encoded JSON + HMAC)."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": int(time.time()) + TOKEN_EXPIRY,
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def decode_token(token: str) -> dict:
    """Decode and verify a token."""
    try:
        payload_b64, sig = token.rsplit(".", 1)
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            raise ValueError("Invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """FastAPI dependency to extract user_id from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    return payload["user_id"]
