from pydantic_settings import BaseSettings
from typing import List


def _validate_production_secrets(env: str, jwt_secret: str) -> None:
    """Warn if production uses default secrets."""
    if env != "production":
        return
    if not jwt_secret or jwt_secret == "change-me-to-a-very-long-random-secret-at-least-32-chars":
        raise ValueError(
            "JWT_SECRET muss in Produktion gesetzt werden! "
            "Generiere einen sicheren Wert: openssl rand -hex 32"
        )


class Settings(BaseSettings):
    # Database (Railway liefert postgresql:// – wir brauchen postgresql+asyncpg://)
    DATABASE_URL: str = "postgresql+asyncpg://socialhero:socialhero@localhost:5432/socialhero"
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def database_url_async(self) -> str:
        """Stellt sicher, dass asyncpg verwendet wird (Railway liefert postgresql://)."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://") and "+asyncpg" not in url:
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # Security
    JWT_SECRET: str = "change-me-to-a-very-long-random-secret-at-least-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Apple Sign In
    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""
    APPLE_PRIVATE_KEY: str = ""

    # Firebase
    FCM_CREDENTIALS_JSON: str = ""

    # App Config
    ALERT_RADIUS_KM: float = 1.0
    ALERT_COUNTDOWN_SEC: int = 5
    ACCEPT_TIMEOUT_SEC: int = 30

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
_validate_production_secrets(settings.ENVIRONMENT, settings.JWT_SECRET)
