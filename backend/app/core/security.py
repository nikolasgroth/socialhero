import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
import httpx

from app.core.config import settings

# Bcrypt has a 72-byte limit; pre-hash with SHA256 so any password length works
def _to_bcrypt_input(password: str) -> bytes:
    h = hashlib.sha256(password.encode()).digest()
    return h[:72]  # max 72 bytes for bcrypt


def hash_password(password: str) -> str:
    pwd_bytes = _to_bcrypt_input(password)
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = _to_bcrypt_input(plain)
    return bcrypt.checkpw(pwd_bytes, hashed.encode())


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


async def verify_google_token(id_token: str) -> Optional[dict]:
    """Verify Google OAuth2 ID token and return user info."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            if data.get("aud") != settings.GOOGLE_CLIENT_ID:
                return None
            return {
                "provider": "google",
                "provider_id": data["sub"],
                "email": data.get("email", ""),
                "name": data.get("name", ""),
                "picture": data.get("picture", ""),
            }
    except Exception:
        return None


async def verify_apple_token(id_token: str) -> Optional[dict]:
    """Verify Apple Sign In ID token and return user info."""
    try:
        async with httpx.AsyncClient() as client:
            # Fetch Apple's public keys
            resp = await client.get("https://appleid.apple.com/auth/keys")
            if resp.status_code != 200:
                return None
            apple_keys = resp.json()

        # Decode the header to find the right key
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")

        matching_key = None
        for key in apple_keys.get("keys", []):
            if key.get("kid") == kid:
                matching_key = key
                break

        if not matching_key:
            return None

        from jose import jwk
        public_key = jwk.construct(matching_key)

        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=settings.APPLE_CLIENT_ID,
            issuer="https://appleid.apple.com",
        )

        return {
            "provider": "apple",
            "provider_id": payload["sub"],
            "email": payload.get("email", ""),
            "name": "",  # Apple only sends name on first auth
            "picture": "",
        }
    except Exception:
        return None
