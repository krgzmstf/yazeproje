"""
Application configuration via Pydantic Settings.
All values are loaded from environment variables or .env file.
"""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "YAZE Proje API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    SECRET_KEY: str = "change-me-in-production"
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:1001",
        "http://127.0.0.1:1001",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://yazeproje.com",
        "https://www.yazeproje.com",
    ]

    # ── Database ─────────────────────────────────────────────────
    USE_SQLITE: bool = True
    SQLITE_DB_FILE: str = "yaze_local.db"

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "yaze_user"
    POSTGRES_PASSWORD: str = "yaze_password"
    POSTGRES_DB: str = "yaze_db"

    @property
    def DATABASE_URL(self) -> str:
        if self.USE_SQLITE:
            return f"sqlite+aiosqlite:///{self.SQLITE_DB_FILE}"
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        """Synchronous URL for Alembic migrations."""
        if self.USE_SQLITE:
            return f"sqlite:///{self.SQLITE_DB_FILE}"
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ── Redis ────────────────────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    @property
    def REDIS_URL(self) -> str:
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # ── JWT / Auth ───────────────────────────────────────────────
    JWT_SECRET_KEY: str = "jwt-change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Email (SMTP) ────────────────────────────────────────────
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "yazeproje@gmail.com"
    SMTP_FROM_NAME: str = "YAZE Proje"
    SMTP_TLS: bool = True

    # ── SMS (Netgsm) ────────────────────────────────────────────
    NETGSM_USERCODE: str = ""
    NETGSM_PASSWORD: str = ""
    NETGSM_MSGHEADER: str = ""

    # ── Scraping ─────────────────────────────────────────────────
    SCRAPER_INTERVAL_MINUTES: int = 60
    SCRAPER_USER_AGENT: str = "YazeBot/1.0"

    # ── File Uploads ─────────────────────────────────────────────
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── Logging ──────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    """Cached singleton for application settings."""
    return Settings()
