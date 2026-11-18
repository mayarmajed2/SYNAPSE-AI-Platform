from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db, test_connection
from app.db.models import Agent
from app.db.seed import seed_database
from app.api.v1 import api_v1_router, ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe auto-initialization when running server
    try:
        if test_connection():
            Base.metadata.create_all(bind=engine)
            seed_database()
            print("SYNAPSE database initialized and seeded successfully.")
    except Exception as e:
        print(f"Database auto-migration skipped on startup: {e}")
    yield


app = FastAPI(
    title="SYNAPSE API",
    description="Autonomous AI Software Engineering Company - Multi-Agent Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware for Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health")
@app.get("/api/v1/health")
async def health(db: Session = Depends(get_db)):
    db_connected = False
    agent_count = 0
    try:
        db_connected = test_connection()
        if db_connected:
            agent_count = db.query(Agent).count()
    except Exception:
        db_connected = False

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": "SYNAPSE Backend",
        "version": "1.0.0",
        "database": {
            "status": "connected" if db_connected else "disconnected",
            "type": "PostgreSQL 16",
        },
        "agents": {
            "registered": agent_count,
            "status": "ready" if agent_count >= 10 else "initializing",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
