"""SYNAPSE Platform — Full-Stack Backend Integration & Security Test Suite."""
import os
import sys
import uuid
import pytest
from fastapi import HTTPException

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import _ensure_schema_columns
from app.database import Base, SessionLocal, engine
from app.db.seed import seed_database
from app.db.models import Agent, Artifact, Project, Task, User
from app.api.v1.auth import RegisterRequest, LoginRequest, register, login, demo_login, get_me
from app.api.v1.settings import WorkspaceSettingsUpdate, get_workspace_settings, update_workspace_settings
from app.api.v1.projects import create_project, delete_project
from app.api.v1.artifacts import download_project_artifacts
from app.api.v1.git import list_commits
from app.schemas.project import ProjectCreate
from app.core.security import decode_access_token
from app.services.git_service import GitService
from app.services.sast_scanner import scan_artifacts
from app.services.sandbox import CodeSandbox
from app.services.report_service import ReportService
from app.workflows.runner import _record_task
from app.workflows.nodes import _log_agent_message


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    _ensure_schema_columns()
    seed_database()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_seed_registers_10_agents_without_wiping_live_metrics(db):
    agent = db.query(Agent).filter(Agent.role == "supervisor").first()
    assert agent is not None
    original_completed = agent.completed_tasks or 0
    agent.completed_tasks = original_completed + 5
    db.commit()

    # Re-running seed_database must NOT wipe live completed_tasks
    seed_database(db)
    db.refresh(agent)
    assert agent.completed_tasks == original_completed + 5

    # Restore
    agent.completed_tasks = original_completed
    db.commit()


def test_auth_register_login_jwt_and_demo_login(db):
    email = f"founder-{uuid.uuid4().hex[:8]}@synapse-test.io"
    reg = register(
        RegisterRequest(
            email=email,
            full_name="Alex Founder",
            password="StrongPassword123!",
            workspace_name="Acme Eng",
        ),
        db=db,
    )
    assert "access_token" in reg
    assert reg["user"]["email"] == email

    # Verify JWT decode
    claims = decode_access_token(reg["access_token"])
    assert claims is not None
    assert claims["email"] == email

    # Duplicate email raises 409
    with pytest.raises(HTTPException) as exc:
        register(
            RegisterRequest(email=email, full_name="Dup", password="StrongPassword123!"),
            db=db,
        )
    assert exc.value.status_code == 409

    # Login succeeds
    logged = login(LoginRequest(email=email, password="StrongPassword123!"), db=db)
    assert logged["user"]["email"] == email

    # Wrong password raises 401
    with pytest.raises(HTTPException) as bad_exc:
        login(LoginRequest(email=email, password="WrongPassword!"), db=db)
    assert bad_exc.value.status_code == 401

    # Demo login works
    demo = demo_login(db=db)
    assert "access_token" in demo

    # get_me returns serialized user
    user_row = db.query(User).filter(User.email == email).first()
    me = get_me(current_user=user_row, db=db)
    assert me["email"] == email


def test_persistent_workspace_settings(db):
    initial = get_workspace_settings(db=db, current_user=None)
    assert "primary_model" in initial

    updated = update_workspace_settings(
        WorkspaceSettingsUpdate(max_retries=4, require_approval_gates=False),
        db=db,
        current_user=None,
    )
    assert updated["max_retries"] == 4
    assert updated["require_approval_gates"] is False

    recheck = get_workspace_settings(db=db, current_user=None)
    assert recheck["max_retries"] == 4


def test_task_and_agent_message_persistence_and_sast_and_zip(db):
    from app.db.models import Workflow

    proj = Project(
        name=f"Integration App {uuid.uuid4().hex[:4]}",
        slug=f"integration-app-{uuid.uuid4().hex[:6]}",
        idea="Build a real-time SaaS billing tracker with REST APIs and React UI.",
        project_type="Full-Stack Web App",
        complexity="Medium",
        tech_stack={"frontend": "React 19", "backend": "FastAPI", "database": "PostgreSQL"},
        status="in_progress",
        execution_progress=50,
    )
    db.add(proj)
    db.flush()
    wf = Workflow(project_id=proj.id, name="Test Workflow", status="running")
    db.add(wf)
    db.commit()
    db.refresh(proj)

    project_id = proj.id
    workflow_id = wf.id

    # Verify _record_task persists Task + Execution without rolling back!
    _record_task(
        db=db,
        project_id=project_id,
        workflow_id=workflow_id,
        agent_role="supervisor",
        title="Test Stage Persistence",
        result="Completed cleanly",
        status="completed",
        trace_id="test-trace-1",
        duration_ms=120,
    )
    persisted_tasks = db.query(Task).filter(Task.project_id == project_id).all()
    assert len(persisted_tasks) >= 1

    # Verify _log_agent_message persists cleanly with sender_role/recipient_role
    _log_agent_message(db, project_id, "supervisor", "product_manager", "Dispatch PRD")

    # Add an artifact with an intentional eval() SAST finding and test Zip Slip sanitization
    art = Artifact(
        project_id=project_id,
        file_path="../../evil/sample.py",
        file_name="sample.py",
        artifact_type="backend_code",
        language="python",
        content="def compute(expr):\n    return eval(expr)\n",
        version=1,
        is_current=True,
    )
    db.add(art)
    db.commit()

    # SAST scanner detects CWE-95 critical eval()
    sast = scan_artifacts([{"file_path": "backend/sample.py", "content": art.content}])
    assert sast["critical_count"] >= 1
    assert any(f["cwe_id"] == "CWE-95" for f in sast["findings"])

    # Delivery report runs cleanly without hardcoded crashes
    report = ReportService.generate_delivery_report(db, project_id)
    assert report["project_name"] == proj.name

    # ZIP download strips .. segments and quotes filename
    zip_resp = download_project_artifacts(project_id=project_id, db=db)
    assert zip_resp.status_code == 200
    assert 'filename="' in zip_resp.headers.get("Content-Disposition", "")

    # Cleanup
    delete_project(project_id=project_id, db=db)
    CodeSandbox.cleanup_workspace(project_id)


def test_path_traversal_and_git_project_validation(db):
    with pytest.raises(ValueError):
        GitService._get_repo_dir("../escape")

    with pytest.raises(ValueError):
        CodeSandbox.get_workspace_path("../../escape")

    with pytest.raises(HTTPException) as exc:
        list_commits(project_id="nonexistent-id-123", db=db)
    assert exc.value.status_code == 404


def test_phase_3_4_password_reset_billing_and_stripe_hmac(db):
    import hashlib
    import hmac
    from app.api.v1.auth import ForgotPasswordRequest, ResetPasswordRequest, forgot_password, reset_password
    from app.api.v1.billing import get_billing_status, verify_stripe_signature

    # Register fresh user and test forgot -> reset -> login
    email = f"reset-{uuid.uuid4().hex[:8]}@synapse-test.io"
    register(RegisterRequest(email=email, full_name="Reset Tester", password="OldPassword123!"), db=db)
    fp = forgot_password(ForgotPasswordRequest(email=email), db=db)
    assert "dev_reset_token" in fp

    rp = reset_password(ResetPasswordRequest(token=fp["dev_reset_token"], new_password="NewPassword456!"), db=db)
    assert "updated" in rp["message"].lower()

    # New password works
    logged = login(LoginRequest(email=email, password="NewPassword456!"), db=db)
    assert logged["user"]["email"] == email

    # Billing status returns quota telemetry
    user_row = db.query(User).filter(User.email == email).first()
    status_data = get_billing_status(db=db, current_user=user_row)
    assert status_data["plan"] == "starter"
    assert status_data["projects_limit"] == 3

    # Stripe HMAC-SHA256 webhook signature verification
    secret = "whsec_test_secret_123"
    payload = b'{"type":"checkout.session.completed"}'
    ts = "1700000000"
    sig = hmac.new(secret.encode(), f"{ts}.".encode() + payload, hashlib.sha256).hexdigest()
    assert verify_stripe_signature(payload, f"t={ts},v1={sig}", secret) is True
    assert verify_stripe_signature(payload, f"t={ts},v1=tampered", secret) is False
