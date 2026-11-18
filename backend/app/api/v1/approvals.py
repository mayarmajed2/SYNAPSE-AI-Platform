from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.enums import ApprovalStatus, AuditEventType
from app.db.models import ApprovalRequest
from app.schemas.approval import ApprovalResolveRequest, ApprovalResponse
from app.services.audit import log_event
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/approvals", tags=["Human Approvals"])


@router.get("", response_model=List[ApprovalResponse])
def list_approvals(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List pending and historical human-in-the-loop approval requests."""
    query = db.query(ApprovalRequest)
    if project_id:
        query = query.filter(ApprovalRequest.project_id == project_id)
    if status:
        query = query.filter(ApprovalRequest.status == status)

    return query.order_by(ApprovalRequest.created_at.desc()).all()


@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: str, db: Session = Depends(get_db)):
    """Retrieve details and context of a specific approval gate."""
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return approval


@router.post("/{approval_id}/resolve", response_model=ApprovalResponse)
async def resolve_approval(approval_id: str, data: ApprovalResolveRequest, db: Session = Depends(get_db)):
    """Grant or reject an approval request, unblocking or steering agent execution."""
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if approval.status != ApprovalStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Approval has already been resolved")

    decision = data.decision.lower().strip()
    if decision not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")

    approval.status = ApprovalStatus.APPROVED.value if decision == "approved" else ApprovalStatus.REJECTED.value
    approval.decision = decision
    approval.resolved_by = data.resolver_name
    approval.comments = data.comments
    approval.resolved_at = datetime.now(timezone.utc)

    event_type = AuditEventType.APPROVAL_GRANTED.value if decision == "approved" else AuditEventType.APPROVAL_REJECTED.value
    log_event(
        db=db,
        event_type=event_type,
        project_id=approval.project_id,
        actor=data.resolver_name,
        details={"approval_id": approval.id, "title": approval.title, "decision": decision, "comments": data.comments},
    )

    db.commit()
    db.refresh(approval)

    await ws_manager.broadcast_to_project(
        project_id=approval.project_id,
        event_type="approval.resolved",
        data={"approval_id": approval.id, "status": approval.status, "decision": decision},
    )

    if decision == "approved" and approval.project_id:
        import asyncio
        from app.workflows.runner import execute_autonomous_workflow
        asyncio.create_task(execute_autonomous_workflow(approval.project_id, skip_approval_check=True))

    return approval

