"""MindCanvas API — Core Configuration."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql+asyncpg://mindcanvas:mindcanvas_dev@db:5432/mindcanvas"
    database_url_sync: str = "postgresql://mindcanvas:mindcanvas_dev@db:5432/mindcanvas"

    # Auth
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Google Calendar
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:8000/api/v1/calendar/callback"

    # AI
    ai_provider: str = "local"  # local | openai | gemini
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

    # Media
    upload_dir: str = "/app/uploads"
    max_file_size_mb: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
