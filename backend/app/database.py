import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables reliably from backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

def _normalize_database_url(url: str) -> str:
    """Normalize cloud PostgreSQL URLs (postgres:// or postgresql://) to psycopg3 dialect."""
    cleaned = (url or "").strip()
    if cleaned.startswith("postgres://"):
        return "postgresql+psycopg://" + cleaned[len("postgres://"):]
    if cleaned.startswith("postgresql://"):
        return "postgresql+psycopg://" + cleaned[len("postgresql://"):]
    return cleaned


DATABASE_URL = _normalize_database_url(
    os.getenv("DATABASE_URL", "postgresql+psycopg://synapse:synapse_dev_2026@localhost:5433/synapse_db")
)

# Fallback SQLite path
SQLITE_PATH = Path(__file__).resolve().parent.parent / "synapse.db"
SQLITE_URL = f"sqlite:///{SQLITE_PATH.as_posix()}"


def _create_working_engine():
    """Attempt primary PostgreSQL connection; fallback to local SQLite if unavailable."""
    # If explicitly configured for SQLite
    if DATABASE_URL.startswith("sqlite"):
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

    try:
        pg_engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            echo=False,
            connect_args={"connect_timeout": 3},
        )
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return pg_engine
    except Exception as e:
        print(f"PostgreSQL connection offline ({e}). Gracefully falling back to local SQLite at {SQLITE_PATH}")
        return create_engine(
            SQLITE_URL,
            connect_args={"check_same_thread": False},
            echo=False,
        )


engine = _create_working_engine()

# Database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for database models
Base = declarative_base()


def get_db():
    """FastAPI dependency to provide a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection() -> bool:
    """Test active database connectivity."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()
            if value == 1:
                return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

    return False
