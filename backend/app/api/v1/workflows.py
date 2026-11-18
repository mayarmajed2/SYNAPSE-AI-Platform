from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.enums import AuditEventType, WorkflowStatus
from app.db.models import Project, Workflow
from app.schemas.workflow import WorkflowResponse, WorkflowStartRequest
from app.services.audit import log_event
from app.services.websocket_manager import ws_manager
from app.workflows.runner import execute_autonomous_workflow

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Retrieve workflow graph, node states, and edge topologies for React Flow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.get("/project/{project_id}", response_model=WorkflowResponse)
def get_project_workflow(project_id: str, db: Session = Depends(get_db)):
    """Retrieve the primary workflow for a given project."""
    workflow = db.query(Workflow).filter(Workflow.project_id == project_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="No workflow found for project")
    return workflow


@router.post("/{workflow_id}/start", response_model=WorkflowResponse)
async def start_workflow(
    workflow_id: str,
    body: Optional[WorkflowStartRequest] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    """Start or trigger autonomous multi-agent execution."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = db.query(Project).filter(Project.id == workflow.project_id).first()

    workflow.status = WorkflowStatus.RUNNING.value
    workflow.started_at = datetime.now(timezone.utc)
    if project:
        project.status = "in_progress"

    log_event(
        db=db,
        event_type=AuditEventType.WORKFLOW_STARTED.value,
        project_id=workflow.project_id,
        actor="User",
        details={"workflow_id": workflow.id, "project_name": project.name if project else ""},
    )

    db.commit()
    db.refresh(workflow)

    await ws_manager.broadcast_to_project(
        project_id=workflow.project_id,
        event_type="workflow.started",
        data={"workflow_id": workflow.id, "status": workflow.status, "current_step": workflow.current_step},
    )

    if background_tasks:
        background_tasks.add_task(execute_autonomous_workflow, workflow.project_id)
    else:
        import asyncio
        asyncio.create_task(execute_autonomous_workflow(workflow.project_id))

    return workflow


@router.post("/{workflow_id}/pause", response_model=WorkflowResponse)
async def pause_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Pause an active workflow execution."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.PAUSED.value
    log_event(
        db=db,
        event_type=AuditEventType.WORKFLOW_PAUSED.value,
        project_id=workflow.project_id,
        actor="User",
        details={"workflow_id": workflow.id},
    )

    db.commit()
    db.refresh(workflow)

    await ws_manager.broadcast_to_project(
        project_id=workflow.project_id,
        event_type="workflow.paused",
        data={"workflow_id": workflow.id, "status": workflow.status},
    )

    return workflow


@router.post("/{workflow_id}/resume", response_model=WorkflowResponse)
async def resume_workflow(workflow_id: str, background_tasks: BackgroundTasks = None, db: Session = Depends(get_db)):
    """Resume a paused workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.RUNNING.value
    log_event(
        db=db,
        event_type=AuditEventType.WORKFLOW_RESUMED.value,
        project_id=workflow.project_id,
        actor="User",
        details={"workflow_id": workflow.id},
    )

    db.commit()
    db.refresh(workflow)

    await ws_manager.broadcast_to_project(
        project_id=workflow.project_id,
        event_type="workflow.resumed",
        data={"workflow_id": workflow.id, "status": workflow.status},
    )

    if background_tasks:
        background_tasks.add_task(execute_autonomous_workflow, workflow.project_id)
    else:
        import asyncio
        asyncio.create_task(execute_autonomous_workflow(workflow.project_id))

    return workflow


@router.post("/{workflow_id}/cancel", response_model=WorkflowResponse)
async def cancel_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Cancel an ongoing workflow execution."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.CANCELLED.value
    log_event(
        db=db,
        event_type="workflow.cancelled",
        project_id=workflow.project_id,
        actor="User",
        details={"workflow_id": workflow.id},
    )

    db.commit()
    db.refresh(workflow)

    await ws_manager.broadcast_to_project(
        project_id=workflow.project_id,
        event_type="workflow.cancelled",
        data={"workflow_id": workflow.id, "status": workflow.status},
    )

    return workflow
