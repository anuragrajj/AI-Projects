from datetime import datetime, timedelta, timezone

from jose import jwt

from src.config import settings


def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, secret_key: str) -> dict:
    # Raises jose.JWTError if the token is malformed, signed with another key, or expired.
    return jwt.decode(token, secret_key, algorithms=[settings.ALGORITHM])
