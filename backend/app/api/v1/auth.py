"""Authentication & User Session API endpoints."""
import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.db.models import User, Workspace

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    full_name: str = Field(..., min_length=2, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    workspace_name: Optional[str] = Field(None, max_length=120)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


def _serialize_user(user: User, db: Session) -> dict:
    workspace = db.query(Workspace).filter(Workspace.owner_id == user.id).first()
    if not workspace:
        workspace = db.query(Workspace).filter(Workspace.slug == "default-workspace").first()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "plan": getattr(workspace, "plan", "pro") or "pro",
        } if workspace else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Please provide a valid email address")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.flush()

    ws_name = (payload.workspace_name or f"{user.full_name.split()[0]}'s Workspace").strip()
    base_slug = re.sub(r"[^a-z0-9]+", "-", ws_name.lower()).strip("-") or "workspace"
    slug = f"{base_slug}-{user.id[:6]}"
    workspace = Workspace(
        name=ws_name,
        slug=slug,
        description="Autonomous AI Software Engineering Workspace",
        plan="starter",
        settings_json={},
        owner_id=user.id,
    )
    db.add(workspace)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, extra_claims={"email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(user, db),
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(subject=user.id, extra_claims={"email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(user, db),
    }


@router.post("/demo-login")
def demo_login(db: Session = Depends(get_db)):
    """One-click sign-in to the seeded SYNAPSE HQ evaluation workspace."""
    user = (
        db.query(User).filter(User.email == "demo@synapse.ai").first()
        or db.query(User).filter(User.email == "admin@synapse.ai").first()
    )
    if not user:
        user = User(
            email="demo@synapse.ai",
            full_name="Principal Engineer",
            password_hash=hash_password("SynapseDemo2026!"),
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id, extra_claims={"email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(user, db),
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _serialize_user(current_user, db)
