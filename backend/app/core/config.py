import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SYNAPSE")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://synapse:synapse_dev_2026@localhost:5433/synapse_db",
    )

    # Groq AI Provider
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_PRIMARY_MODEL: str = os.getenv("GROQ_PRIMARY_MODEL", "llama-3.3-70b-versatile")
    GROQ_FAST_MODEL: str = os.getenv("GROQ_FAST_MODEL", "llama-3.1-8b-instant")

    # Execution limits
    MAX_RETRIES_PER_TASK: int = int(os.getenv("MAX_RETRIES_PER_TASK", "3"))
    SANDBOX_TIMEOUT_SECONDS: int = int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "30"))


settings = Settings()
