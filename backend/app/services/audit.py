"""Append-only audit logging service for SYNAPSE."""

from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from app.db.models import AuditLog


def log_event(
    db: Session,
    event_type: str,
    project_id: Optional[str] = None,
    actor: str = "System",
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Record an immutable audit log entry."""
    entry = AuditLog(
        event_type=event_type,
        project_id=project_id,
        actor=actor,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

