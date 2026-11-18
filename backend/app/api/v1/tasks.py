from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.enums import AuditEventType, TaskStatus
from app.db.models import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.audit import log_event
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List tasks across projects with filtering by agent, project, or status."""
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if agent_id:
        query = query.filter(Task.assigned_agent_id == agent_id)

    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Retrieve full task details, execution outputs, and error logs."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskResponse)
async def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    """Manually or programmatically register a new task."""
    task = Task(
        project_id=data.project_id,
        workflow_id=data.workflow_id,
        assigned_agent_id=data.assigned_agent_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        input_data=data.input_data,
        dependencies=data.dependencies,
        max_retries=data.max_retries,
        status=TaskStatus.PENDING.value,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    log_event(
        db=db,
        event_type=AuditEventType.TASK_CREATED.value,
        project_id=task.project_id,
        actor="System",
        details={"task_id": task.id, "title": task.title},
    )

    await ws_manager.broadcast_to_project(
        project_id=task.project_id,
        event_type="task.created",
        data={"task_id": task.id, "title": task.title, "status": task.status},
    )

    return task


@router.post("/{task_id}/retry", response_model=TaskResponse)
async def retry_task(task_id: str, db: Session = Depends(get_db)):
    """Retry a failed or blocked task if retry limit is not exceeded."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.retry_count >= task.max_retries:
        raise HTTPException(status_code=400, detail=f"Maximum retry limit ({task.max_retries}) reached")

    task.retry_count += 1
    task.status = TaskStatus.PENDING.value
    task.error_message = None

    log_event(
        db=db,
        event_type="task.retried",
        project_id=task.project_id,
        actor="User",
        details={"task_id": task.id, "retry_count": task.retry_count},
    )

    db.commit()
    db.refresh(task)

    await ws_manager.broadcast_to_project(
        project_id=task.project_id,
        event_type="task.retried",
        data={"task_id": task.id, "retry_count": task.retry_count, "status": task.status},
    )

    return task

