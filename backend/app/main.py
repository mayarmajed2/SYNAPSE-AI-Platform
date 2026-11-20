from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import SecurityAndRateLimitMiddleware
from app.database import Base, engine, get_db, test_connection
from app.db.models import Agent
from app.db.seed import seed_database
from app.api.v1 import api_v1_router, ws_router


def _ensure_schema_columns():
    """Safely add newly introduced columns to existing SQLite/PostgreSQL databases without data loss."""
    inspector = inspect(engine)
    dialect = engine.dialect.name
    json_col_type = "JSONB" if dialect == "postgresql" else "JSON"

    migrations = [
        ("users", "password_hash", "VARCHAR(255)"),
        ("workspaces", "plan", "VARCHAR(50) DEFAULT 'pro'"),
        ("workspaces", "settings_json", f"{json_col_type} DEFAULT '{{}}'"),
    ]
    with engine.begin() as conn:
        for table, column, col_def in migrations:
            if table in inspector.get_table_names():
                existing_cols = {c["name"] for c in inspector.get_columns(table)}
                if column not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_def}"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        if test_connection():
            Base.metadata.create_all(bind=engine)
            _ensure_schema_columns()
            seed_database()
            print("SYNAPSE database initialized and seeded successfully.")
    except Exception as e:
        print(f"Database auto-migration skipped on startup: {e}")
    yield


app = FastAPI(
    title="SYNAPSE API",
    description="Autonomous AI Software Engineering Company - Multi-Agent Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# Security Headers & Sliding-Window Rate Limiting
app.add_middleware(SecurityAndRateLimitMiddleware)

# CORS Middleware (env-configurable)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API and WebSocket routes
app.include_router(api_v1_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to SYNAPSE",
        "description": "Autonomous AI Software Engineering Platform",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health")
@app.get("/api/v1/health")
async def health(db: Session = Depends(get_db)):
    db_connected = False
    agent_count = 0
    dialect = engine.dialect.name
    db_label = "PostgreSQL 16" if dialect == "postgresql" else "SQLite (Local)"
    try:
        db_connected = test_connection()
        if db_connected:
            agent_count = db.query(Agent).count()
    except Exception:
        db_connected = False

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": "SYNAPSE Backend",
        "version": "2.0.0",
        "database": {
            "status": "connected" if db_connected else "disconnected",
            "type": db_label,
            "dialect": dialect,
        },
        "agents": {
            "registered": agent_count,
            "status": "ready" if agent_count >= 10 else "initializing",
        },
        "llm": {
            "provider": "Groq",
            "configured": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here"),
            "primary_model": settings.GROQ_PRIMARY_MODEL,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
