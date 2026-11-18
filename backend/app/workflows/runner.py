"""Autonomous multi-agent lifecycle execution runner with intelligent feedback loops and parallel task execution."""

import asyncio
from datetime import datetime, timezone
import uuid
from typing import Any, Dict
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.enums import AgentRole, ApprovalStatus, AuditEventType, ProjectStatus, RiskLevel, TaskStatus, WorkflowStatus
from app.db.models import Agent, ApprovalRequest, Execution, Project, Task, Workflow
from app.services.audit import log_event
from app.services.git_service import GitService
from app.services.websocket_manager import ws_manager
from app.workflows.nodes import (
    architect_node,
    backend_dev_node,             
    deployment_node,
    docs_node,
    frontend_dev_node,
    product_manager_node,
    qa_node,
    reviewer_node,
    security_node,
    supervisor_plan_node,
)

MAX_STAGE_RETRIES = 3


def _update_agent_status(db: Session, role: str, status: str, task_name: str = ""):
    """Update an agent's live status in the database."""
    agent = db.query(Agent).filter(Agent.role == role).first()
    if agent:
        agent.status = status
        if task_name:
            agent.current_task = task_name
        db.commit()


def _record_task(
    db: Session,
    project_id: str,
    workflow_id: str,
    agent_role: str,
    title: str,
    result: str,
    status: str,
    trace_id: str = None,
):
    """Persist a completed task record and execution trace."""
    try:
        agent = db.query(Agent).filter(Agent.role == agent_role).first()
        task = Task(
            project_id=project_id,
            workflow_id=workflow_id,
            assigned_agent_id=agent.id if agent else None,
            title=title,
            description=f"Autonomous execution by {agent.name if agent else agent_role} [Trace: {trace_id or 'default'}]",
            status=status,
            output_data={"result": result, "trace_id": trace_id},
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(task)
        db.flush()

        if agent and status == TaskStatus.COMPLETED.value:
            agent.completed_tasks = (agent.completed_tasks or 0) + 1
            agent.total_tasks = (agent.total_tasks or 0) + 1
            agent.status = "idle"

        # Record fine-grained execution trace
        execution = Execution(
            task_id=task.id,
            agent_id=agent.id if agent else None,
            status=status,
            output_data={"result": result},
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(execution)
        db.commit()
    except Exception as e:
        print(f"Warning: Could not record task for {agent_role}: {e}")
        db.rollback()


async def _run_stage_with_retry(
    stage_fn,
    state: Dict[str, Any],
    db: Session,
    agent_role: str,
    stage_name: str,
    project_id: str,
    workflow_id: str,
    trace_id: str,
    max_retries: int = MAX_STAGE_RETRIES,
) -> Dict[str, Any]:
    """Execute a single agent stage with automatic retry and error recovery."""
    attempt = 0
    last_error = None

    while attempt < max_retries:
        attempt += 1
        stage_db = SessionLocal()
        try:
            _update_agent_status(stage_db, agent_role, "working", stage_name)
            result_state = await stage_fn(state, stage_db)

            await ws_manager.broadcast_to_project(
                project_id=project_id,
                event_type="stage.completed",
                data={
                    "stage": stage_name,
                    "agent_role": agent_role,
                    "attempt": attempt,
                    "trace_id": trace_id,
                },
            )

            _record_task(
                stage_db, project_id, workflow_id, agent_role, stage_name,
                f"Stage completed successfully on attempt {attempt}.",
                TaskStatus.COMPLETED.value,
                trace_id=trace_id,
            )
            _update_agent_status(stage_db, agent_role, "idle")
            return result_state

        except Exception as e:
            last_error = e
            stage_db.rollback()
            print(f"Stage '{stage_name}' attempt {attempt}/{max_retries} failed: {e}")

            await ws_manager.broadcast_to_project(
                project_id=project_id,
                event_type="stage.retry",
                data={"stage": stage_name, "attempt": attempt, "error": str(e), "trace_id": trace_id},
            )

            if attempt < max_retries:
                await asyncio.sleep(0.5 * attempt)
        finally:
            stage_db.close()

    stage_db = SessionLocal()
    try:
        _record_task(
            stage_db, project_id, workflow_id, agent_role, stage_name,
            f"Stage failed after {max_retries} retries: {last_error}",
            TaskStatus.FAILED.value,
            trace_id=trace_id,
        )
        _update_agent_status(stage_db, agent_role, "idle")
    finally:
        stage_db.close()
    raise RuntimeError(f"Stage '{stage_name}' failed after {max_retries} retries: {last_error}")


async def execute_autonomous_workflow(project_id: str, skip_approval_check: bool = False):
    """Execute complete 10-stage multi-agent pipeline with parallel execution, git tracking, and feedback loops."""
    db = SessionLocal()
    workflow = None
    correlation_id = uuid.uuid4().hex[:12]

    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        workflow = db.query(Workflow).filter(Workflow.project_id == project_id).first()
        if not workflow:
            return

        if workflow.status == WorkflowStatus.COMPLETED.value:
            return

        # Initialize project git repository
        GitService.init_repository(project.id, project.name)

        workflow.status = WorkflowStatus.RUNNING.value
        workflow.started_at = datetime.now(timezone.utc)
        project.status = ProjectStatus.IN_PROGRESS.value
        db.commit()

        await ws_manager.broadcast_to_project(
            project_id=project.id,
            event_type="workflow.started",
            data={"project_id": project.id, "project_name": project.name, "correlation_id": correlation_id},
        )

        state: Dict[str, Any] = {
            "project_id": project.id,
            "workflow_id": workflow.id,
            "project_name": project.name,
            "idea": project.idea,
            "correlation_id": correlation_id,
            "current_step": "Initialization",
            "retry_counts": {},
            "needs_approval": False,
            "is_approved": False,
            "logs": [],
        }

        # ── Stage 1: Supervisor Planning ──────────────────────────────────────
        trace_1 = f"{correlation_id}-01"
        state = await _run_stage_with_retry(
            supervisor_plan_node, state, db,
            AgentRole.SUPERVISOR.value, "Project Planning & Task Decomposition",
            project.id, workflow.id, trace_id=trace_1,
        )
        project.execution_progress = 10
        workflow.current_step = "Product Requirements"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 2: Product Manager PRD ──────────────────────────────────────
        trace_2 = f"{correlation_id}-02"
        state = await _run_stage_with_retry(
            product_manager_node, state, db,
            AgentRole.PRODUCT_MANAGER.value, "PRD & User Stories",
            project.id, workflow.id, trace_id=trace_2,
        )
        project.execution_progress = 22
        project.mvp_scope = state.get("prd", {}).get("mvp_scope", {})
        workflow.current_step = "System Architecture"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 3: System Architect ─────────────────────────────────────────
        trace_3 = f"{correlation_id}-03"
        state = await _run_stage_with_retry(
            architect_node, state, db,
            AgentRole.SYSTEM_ARCHITECT.value, "Architecture & API Design",
            project.id, workflow.id, trace_id=trace_3,
        )
        project.execution_progress = 35
        workflow.current_step = "Human Approval Gate"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Human Approval Gate (if configured and not bypassed) ──────────────
        require_approval = project.metadata_json.get("require_approval_before_dev", False) and not skip_approval_check
        if require_approval:
            approval = ApprovalRequest(
                project_id=project.id,
                workflow_id=workflow.id,
                title="Architecture & PRD Sign-off Required",
                description=(
                    "The Product Manager and System Architect have produced specifications. "
                    "Human verification required before code generation proceeds."
                ),
                risk_level=RiskLevel.MEDIUM.value,
                status=ApprovalStatus.PENDING.value,
                requested_by="Supervisor Agent",
                metadata_json={
                    "prd_overview": state.get("prd", {}).get("overview", ""),
                    "architecture_overview": state.get("architecture", {}).get("architecture_overview", ""),
                },
            )
            db.add(approval)
            workflow.status = WorkflowStatus.WAITING_APPROVAL.value
            project.status = "review"
            db.commit()

            await ws_manager.broadcast_to_project(
                project_id=project.id,
                event_type="approval.required",
                data={
                    "approval_id": approval.id,
                    "title": approval.title,
                    "description": approval.description,
                },
            )
            return

        # ── Stage 4 & 5: Parallel Independent Execution (Backend + Frontend) ──
        trace_4 = f"{correlation_id}-04"
        trace_5 = f"{correlation_id}-05"
        workflow.current_step = "Parallel Code Generation (Backend & Frontend)"
        db.commit()

        # Run Backend and Frontend concurrently using asyncio.gather
        state_backend_task = _run_stage_with_retry(
            backend_dev_node, dict(state), db,
            AgentRole.BACKEND_DEVELOPER.value, "Backend API & Schemas Implementation",
            project.id, workflow.id, trace_id=trace_4,
        )
        state_frontend_task = _run_stage_with_retry(
            frontend_dev_node, dict(state), db,
            AgentRole.FRONTEND_DEVELOPER.value, "Frontend UI & Client Integration",
            project.id, workflow.id, trace_id=trace_5,
        )

        res_backend, res_frontend = await asyncio.gather(state_backend_task, state_frontend_task)
        state["backend_files"] = res_backend.get("backend_files", [])
        state["frontend_files"] = res_frontend.get("frontend_files", [])

        project.execution_progress = 60
        workflow.current_step = "Code Review"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 6: Code Reviewer ────────────────────────────────────────────
        trace_6 = f"{correlation_id}-06"
        state = await _run_stage_with_retry(
            reviewer_node, state, db,
            AgentRole.CODE_REVIEWER.value, "Code Review & Static Analysis",
            project.id, workflow.id, trace_id=trace_6,
        )
        project.execution_progress = 70
        workflow.current_step = "QA Verification"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 7: QA Engineer (with Sandbox Execution & Feedback Loop) ─────
        trace_7 = f"{correlation_id}-07"
        state = await _run_stage_with_retry(
            qa_node, state, db,
            AgentRole.QA_ENGINEER.value, "Automated QA Test Suite & Sandbox Execution",
            project.id, workflow.id, trace_id=trace_7,
        )

        # ── Intelligent Iterative Feedback Loop: If QA Diagnostic flags defects
        if state.get("qa_results", {}).get("has_diagnostic_failure"):
            await ws_manager.broadcast_to_project(
                project_id=project.id,
                event_type="feedback.loop_triggered",
                data={
                    "from_agent": "qa_engineer",
                    "to_agent": "backend_developer",
                    "message": "Iterative patch triggered by test failure diagnosis.",
                },
            )
            # Re-run backend developer patch
            state = await _run_stage_with_retry(
                backend_dev_node, state, db,
                AgentRole.BACKEND_DEVELOPER.value, "Automated Defect Remediation Patch",
                project.id, workflow.id, trace_id=f"{trace_7}-patch",
            )
            # Re-verify in QA
            state = await _run_stage_with_retry(
                qa_node, state, db,
                AgentRole.QA_ENGINEER.value, "QA Regression Re-Test After Patch",
                project.id, workflow.id, trace_id=f"{trace_7}-retest",
            )

        project.execution_progress = 80
        workflow.current_step = "Security Audit"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 8: Security Agent ───────────────────────────────────────────
        trace_8 = f"{correlation_id}-08"
        state = await _run_stage_with_retry(
            security_node, state, db,
            AgentRole.SECURITY_AGENT.value, "OWASP & Secrets Audit",
            project.id, workflow.id, trace_id=trace_8,
        )
        project.execution_progress = 88
        workflow.current_step = "Documentation"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 9: Documentation Agent ─────────────────────────────────────
        trace_9 = f"{correlation_id}-09"
        state = await _run_stage_with_retry(
            docs_node, state, db,
            AgentRole.DOCUMENTATION_AGENT.value, "Documentation & Delivery Runbook",
            project.id, workflow.id, trace_id=trace_9,
        )
        project.execution_progress = 94
        workflow.current_step = "Containerization & Deployment Manifests"
        db.commit()
        await asyncio.sleep(0.2)

        # ── Stage 10: Deployment Agent (DevOps Specialist) ────────────────────
        trace_10 = f"{correlation_id}-10"
        state = await _run_stage_with_retry(
            deployment_node, state, db,
            AgentRole.DEPLOYMENT_AGENT.value, "Containerization & Deployment Manifests",
            project.id, workflow.id, trace_id=trace_10,
        )

        project.execution_progress = 100
        project.status = ProjectStatus.COMPLETED.value
        workflow.status = WorkflowStatus.COMPLETED.value
        workflow.completed_at = datetime.now(timezone.utc)
        workflow.current_step = "Delivered"

        from app.db.models import Artifact
        artifact_count = db.query(Artifact).filter(Artifact.project_id == project.id).count()

        log_event(
            db=db,
            event_type=AuditEventType.PROJECT_DELIVERED.value,
            project_id=project.id,
            actor="Supervisor Agent",
            details={
                "artifacts_generated": artifact_count,
                "project_name": project.name,
                "total_stages": 10,
                "all_stages_passed": True,
                "correlation_id": correlation_id,
            },
        )

        db.commit()

        await ws_manager.broadcast_to_project(
            project_id=project.id,
            event_type="workflow.completed",
            data={
                "project_id": project.id,
                "status": "completed",
                "progress": 100,
                "artifacts": artifact_count,
                "correlation_id": correlation_id,
            },
        )

        await ws_manager.broadcast_global(
            event_type="project.delivered",
            data={"project_id": project.id, "project_name": project.name},
        )

    except Exception as e:
        print(f"Workflow execution failure for project {project_id}: {e}")
        if workflow:
            try:
                workflow.status = WorkflowStatus.FAILED.value
                workflow.current_step = f"Failed: {str(e)[:120]}"
                db.commit()

                await ws_manager.broadcast_to_project(
                    project_id=project_id,
                    event_type="workflow.failed",
                    data={"project_id": project_id, "error": str(e)[:200]},
                )
            except Exception as inner:
                print(f"Could not update workflow failure state: {inner}")
    finally:
        db.close()
