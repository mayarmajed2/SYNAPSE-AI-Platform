import os
import secrets
from pathlib import Path
from typing import List
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()


def _parse_csv(raw: str, default: List[str]) -> List[str]:
    items = [item.strip() for item in raw.split(",") if item.strip()]
    return items or default


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SYNAPSE")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://synapse:synapse_dev_2026@localhost:5433/synapse_db",
    )

    # Security & Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "") or secrets.token_urlsafe(32)
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "false").lower() == "true"
    CORS_ORIGINS: List[str] = _parse_csv(
        os.getenv("CORS_ORIGINS", ""),
        [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ],
    )
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "240"))

    # Billing (Stripe) & GitHub Integrations
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PRO_PRICE_ID: str = os.getenv("STRIPE_PRO_PRICE_ID", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")

    # Groq AI Provider
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_PRIMARY_MODEL: str = os.getenv("GROQ_PRIMARY_MODEL", "llama-3.3-70b-versatile")
    GROQ_FAST_MODEL: str = os.getenv("GROQ_FAST_MODEL", "llama-3.1-8b-instant")

    # Execution limits & Sandbox Isolation
    MAX_RETRIES_PER_TASK: int = int(os.getenv("MAX_RETRIES_PER_TASK", "3"))
    SANDBOX_TIMEOUT_SECONDS: int = int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "30"))
    SANDBOX_MODE: str = os.getenv("SANDBOX_MODE", "auto")  # "docker" | "local" | "auto"


settings = Settings()
