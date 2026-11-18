from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AuditLog
from app.schemas.audit import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit & Activity Logs"])


@router.get("/logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    project_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve immutable append-only activity & audit trail records."""
    query = db.query(AuditLog)
    if project_id:
        query = query.filter(AuditLog.project_id == project_id)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)

    return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

