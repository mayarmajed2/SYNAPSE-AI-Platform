"""Persistent Workspace Settings & Plan Configuration API."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings as app_settings
from app.core.security import get_optional_user
from app.db.database import get_db
from app.db.models import User, Workspace

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_WORKSPACE_SETTINGS = {
    "primary_model": app_settings.GROQ_PRIMARY_MODEL,
    "fast_model": app_settings.GROQ_FAST_MODEL,
    "max_retries": app_settings.MAX_RETRIES_PER_TASK,
    "sandbox_timeout_seconds": app_settings.SANDBOX_TIMEOUT_SECONDS,
    "require_approval_gates": True,
    "auto_run_security_scan": True,
    "workspace_name": "SYNAPSE HQ",
    "plan": "pro",
}


class WorkspaceSettingsUpdate(BaseModel):
    primary_model: Optional[str] = Field(None, min_length=2, max_length=120)
    fast_model: Optional[str] = Field(None, min_length=2, max_length=120)
    max_retries: Optional[int] = Field(None, ge=0, le=10)
    sandbox_timeout_seconds: Optional[int] = Field(None, ge=5, le=120)
    require_approval_gates: Optional[bool] = None
    auto_run_security_scan: Optional[bool] = None
    workspace_name: Optional[str] = Field(None, min_length=2, max_length=120)
    plan: Optional[str] = Field(None, pattern="^(starter|pro|enterprise)$")


def _resolve_workspace(db: Session, user: Optional[User]) -> Workspace:
    ws = None
    if user:
        ws = db.query(Workspace).filter(Workspace.owner_id == user.id).first()
    if not ws:
        ws = db.query(Workspace).filter(Workspace.slug == "default-workspace").first()
    if not ws:
        ws = Workspace(
            name="SYNAPSE HQ",
            slug="default-workspace",
            description="Primary autonomous software engineering workspace",
            plan="pro",
            settings_json=dict(DEFAULT_WORKSPACE_SETTINGS),
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
    return ws


@router.get("")
def get_workspace_settings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    ws = _resolve_workspace(db, current_user)
    merged = dict(DEFAULT_WORKSPACE_SETTINGS)
    if isinstance(ws.settings_json, dict):
        merged.update(ws.settings_json)
    merged["workspace_name"] = ws.name
    merged["plan"] = getattr(ws, "plan", "pro") or "pro"
    merged["groq_configured"] = bool(app_settings.GROQ_API_KEY and app_settings.GROQ_API_KEY != "your_groq_api_key_here")
    return merged


@router.put("")
def update_workspace_settings(
    payload: WorkspaceSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    ws = _resolve_workspace(db, current_user)
    current = dict(DEFAULT_WORKSPACE_SETTINGS)
    if isinstance(ws.settings_json, dict):
        current.update(ws.settings_json)

    updates = payload.model_dump(exclude_unset=True)
    if "workspace_name" in updates and updates["workspace_name"]:
        ws.name = updates["workspace_name"].strip()
    if "plan" in updates and updates["plan"]:
        ws.plan = updates["plan"]

    current.update(updates)
    ws.settings_json = current
    db.add(ws)
    db.commit()
    db.refresh(ws)

    current["workspace_name"] = ws.name
    current["plan"] = ws.plan
    current["groq_configured"] = bool(app_settings.GROQ_API_KEY and app_settings.GROQ_API_KEY != "your_groq_api_key_here")
    return current
