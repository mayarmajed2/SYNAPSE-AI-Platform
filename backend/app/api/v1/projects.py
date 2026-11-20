import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_optional_user, resolve_active_workspace_id
from app.db.database import get_db
from app.db.enums import AuditEventType, NodeStatus, ProjectStatus, WorkflowStatus
from app.db.models import Artifact, Project, SecurityScan, TestRun, User, Workflow, WorkflowEdge, WorkflowNode, Workspace
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectSummary, ProjectUpdate
from app.services.audit import log_event
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/projects", tags=["Projects"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[-\s]+", "-", text)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Create a new project scoped to the active tenant workspace and enforce plan quotas."""
    workspace = None
    active_ws_id = resolve_active_workspace_id(db, current_user)
    if active_ws_id:
        workspace = db.query(Workspace).filter(Workspace.id == active_ws_id).first()
    if not workspace and data.workspace_id:
        workspace = db.query(Workspace).filter(Workspace.id == data.workspace_id).first()
    if not workspace:
        workspace = db.query(Workspace).first()
        if not workspace:
            workspace = Workspace(
                name="Default Workspace",
                slug="default-workspace",
                description="Default engineering workspace",
                plan="pro",
            )
            db.add(workspace)
            db.flush()

    # Enforce Starter plan project quota (3 projects max)
    plan = (getattr(workspace, "plan", "pro") or "pro").lower()
    if plan == "starter":
        current_count = db.query(Project).filter(Project.workspace_id == workspace.id).count()
        if current_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Starter plan limit reached (3 projects). Upgrade to Pro for unlimited autonomous projects.",
            )

    import uuid as _uuid
    slug = f"{slugify(data.name)}-{_uuid.uuid4().hex[:6]}"
    project = Project(
        workspace_id=workspace.id,
        name=data.name,
        slug=slug,
        description=data.description or data.idea[:200],
        idea=data.idea,
        project_type=data.project_type,
        complexity=data.complexity,
        tech_stack=data.tech_stack or {"frontend": "React + TypeScript", "backend": "FastAPI", "database": "PostgreSQL"},
        status=ProjectStatus.PLANNING.value,
        execution_progress=5,
        mvp_scope={},
        metadata_json={"require_approval_before_dev": data.require_approval_before_dev},
    )
    db.add(project)
    db.flush()

    # Create associated default multi-agent workflow with standard graph topology
    workflow = Workflow(
        project_id=project.id,
        name=f"{project.name} Autonomous Lifecycle",
        description="Standard 9-stage multi-agent autonomous engineering workflow",
        status=WorkflowStatus.PENDING.value,
        current_step="Product Requirements",
        total_steps=10,
        execution_plan=[
            {"step": 1, "agent": "supervisor", "title": "Project Initialization & Planning"},
            {"step": 2, "agent": "product_manager", "title": "Product Requirements & PRD"},
            {"step": 3, "agent": "system_architect", "title": "System Architecture & DB Design"},
            {"step": 4, "agent": "backend_developer", "title": "Backend API & Schemas Implementation"},
            {"step": 5, "agent": "frontend_developer", "title": "Frontend UI & Client Integration"},
            {"step": 6, "agent": "code_reviewer", "title": "Code Review & Static Analysis"},
            {"step": 7, "agent": "qa_engineer", "title": "QA Test Suite & Sandbox Validation"},
            {"step": 8, "agent": "security_agent", "title": "Security & Vulnerability Audit"},
            {"step": 9, "agent": "documentation_agent", "title": "Documentation & Delivery Runbook"},
            {"step": 10, "agent": "deployment_agent", "title": "Containerization & Staging Deployment"},
        ],
        config={"require_approval_before_dev": data.require_approval_before_dev, "max_retries": 3},
    )
    db.add(workflow)
    db.flush()

    # Populate Workflow Nodes for React Flow graph visualization
    nodes_config = [
        {"key": "node-supervisor", "agent": "supervisor", "title": "Supervisor Orchestrator", "x": 50, "y": 150},
        {"key": "node-pm", "agent": "product_manager", "title": "Product Manager (PRD)", "x": 280, "y": 70},
        {"key": "node-architect", "agent": "system_architect", "title": "System Architect", "x": 520, "y": 70},
        {"key": "node-backend", "agent": "backend_developer", "title": "Backend Developer", "x": 760, "y": 30},
        {"key": "node-frontend", "agent": "frontend_developer", "title": "Frontend Developer", "x": 760, "y": 150},
        {"key": "node-reviewer", "agent": "code_reviewer", "title": "Code Reviewer", "x": 1000, "y": 90},
        {"key": "node-qa", "agent": "qa_engineer", "title": "QA Engineer (Tests)", "x": 1220, "y": 40},
        {"key": "node-security", "agent": "security_agent", "title": "Security Agent (OWASP)", "x": 1220, "y": 160},
        {"key": "node-docs", "agent": "documentation_agent", "title": "Documentation & Runbook", "x": 1460, "y": 100},
        {"key": "node-deploy", "agent": "deployment_agent", "title": "DevOps & Cloud Deployment", "x": 1680, "y": 100},
    ]

    for nc in nodes_config:
        wn = WorkflowNode(
            workflow_id=workflow.id,
            node_key=nc["key"],
            agent_role=nc["agent"],
            title=nc["title"],
            status=NodeStatus.PENDING.value,
            position_x=nc["x"],
            position_y=nc["y"],
        )
        db.add(wn)

    # Populate Workflow Edges
    edges_config = [
        ("edge-1", "node-supervisor", "node-pm"),
        ("edge-2", "node-pm", "node-architect"),
        ("edge-3", "node-architect", "node-backend"),
        ("edge-4", "node-architect", "node-frontend"),
        ("edge-5", "node-backend", "node-reviewer"),
        ("edge-6", "node-frontend", "node-reviewer"),
        ("edge-7", "node-reviewer", "node-qa"),
        ("edge-8", "node-reviewer", "node-security"),
        ("edge-9", "node-qa", "node-docs"),
        ("edge-10", "node-security", "node-docs"),
        ("edge-11", "node-docs", "node-deploy"),
        ("edge-feedback-qa", "node-qa", "node-backend", "failure_loop", True),
    ]

    for item in edges_config:
        edge_key = item[0]
        src = item[1]
        tgt = item[2]
        edge_type = item[3] if len(item) > 3 else "default"
        animated = item[4] if len(item) > 4 else False

        we = WorkflowEdge(
            workflow_id=workflow.id,
            edge_key=edge_key,
            source_node_id=src,
            target_node_id=tgt,
            edge_type=edge_type,
            animated=animated,
        )
        db.add(we)

    log_event(
        db=db,
        event_type=AuditEventType.PROJECT_CREATED.value,
        project_id=project.id,
        actor="User",
        details={"name": project.name, "idea": project.idea, "project_type": project.project_type},
    )

    db.commit()
    db.refresh(project)

    # Broadcast real-time project creation event
    await ws_manager.broadcast_to_project(
        project_id=project.id,
        event_type="project.created",
        data={"project_id": project.id, "name": project.name, "status": project.status},
    )

    return project


@router.get("", response_model=List[ProjectSummary])
def list_projects(
    search: Optional[str] = Query(None, description="Search term for name or idea"),
    status: Optional[str] = Query(None, description="Filter by project status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List projects strictly scoped to the active tenant workspace."""
    workspace_id = resolve_active_workspace_id(db, current_user)
    query = db.query(Project)
    if workspace_id and current_user:
        query = query.filter(Project.workspace_id == workspace_id)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%") | Project.idea.ilike(f"%{search}%"))
    if status:
        query = query.filter(Project.status == status)

    return query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Retrieve full project details by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    """Update project metadata or execution state."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(project, field, val)

    log_event(
        db=db,
        event_type=AuditEventType.PROJECT_UPDATED.value,
        project_id=project.id,
        actor="System",
        details=update_dict,
    )

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a project and all associated cascades."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    log_event(
        db=db,
        event_type=AuditEventType.PROJECT_ARCHIVED.value,
        project_id=project.id,
        actor="User",
        details={"project_name": project.name},
    )

    db.delete(project)
    db.commit()
    return None


@router.get("/{project_id}/details")
def get_project_details(project_id: str, db: Session = Depends(get_db)):
    """Retrieve comprehensive project details including workflow, artifact counts, tests, and security."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    workflow = db.query(Workflow).filter(Workflow.project_id == project_id).first()
    artifact_count = db.query(Artifact).filter(Artifact.project_id == project_id).count()
    test_run_count = db.query(TestRun).filter(TestRun.project_id == project_id).count()
    security_scan_count = db.query(SecurityScan).filter(SecurityScan.project_id == project_id).count()

    nodes = []
    if workflow:
        workflow_nodes = db.query(WorkflowNode).filter(WorkflowNode.workflow_id == workflow.id).all()
        nodes = [
            {
                "id": n.id,
                "node_key": n.node_key,
                "agent_role": n.agent_role,
                "title": n.title,
                "status": n.status,
                "duration_ms": n.duration_ms or 0,
                "position_x": n.position_x,
                "position_y": n.position_y,
                "error_message": n.error_message,
            }
            for n in workflow_nodes
        ]

    return {
        "id": project.id,
        "name": project.name,
        "slug": project.slug,
        "idea": project.idea,
        "description": project.description,
        "project_type": project.project_type,
        "complexity": project.complexity,
        "tech_stack": project.tech_stack,
        "status": project.status,
        "execution_progress": project.execution_progress,
        "mvp_scope": project.mvp_scope,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "workflow": {
            "id": workflow.id if workflow else None,
            "status": workflow.status if workflow else "pending",
            "current_step": workflow.current_step if workflow else None,
            "total_steps": workflow.total_steps if workflow else 9,
            "started_at": workflow.started_at.isoformat() if workflow and workflow.started_at else None,
            "completed_at": workflow.completed_at.isoformat() if workflow and workflow.completed_at else None,
            "nodes": nodes,
        } if workflow else None,
        "stats": {
            "artifact_count": artifact_count,
            "test_run_count": test_run_count,
            "security_scan_count": security_scan_count,
        },
    }

