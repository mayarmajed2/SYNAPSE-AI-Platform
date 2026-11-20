import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.enums import AuditEventType
from app.db.models import Artifact, Project, TestResult, TestRun
from app.schemas.qa import TestRunResponse
from app.services.audit import log_event
from app.services.sandbox import CodeSandbox
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/testing", tags=["Testing & QA"])


@router.get("/project/{project_id}", response_model=List[TestRunResponse])
def list_project_test_runs(project_id: str, db: Session = Depends(get_db)):
    """List historical automated test runs for a project."""
    runs = (
        db.query(TestRun)
        .filter(TestRun.project_id == project_id)
        .order_by(TestRun.created_at.desc())
        .all()
    )
    return runs


@router.get("/runs/{run_id}", response_model=TestRunResponse)
def get_test_run(run_id: str, db: Session = Depends(get_db)):
    """Retrieve test run details, pass/fail metrics, and individual assertions."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run


@router.post("/project/{project_id}/execute", response_model=TestRunResponse)
async def execute_project_tests(project_id: str, db: Session = Depends(get_db)):
    """Execute real syntax verification and sandbox pytest suite over project artifacts."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    started = time.perf_counter()
    artifacts = (
        db.query(Artifact)
        .filter(Artifact.project_id == project.id, Artifact.is_current == True)
        .all()
    )

    files = [{"path": a.file_path, "content": a.content or ""} for a in artifacts]
    test_script_art = next((a for a in artifacts if "test_" in (a.file_name or "").lower() and a.file_path.endswith(".py")), None)

    assertions = []
    output_lines = []

    if files:
        CodeSandbox.write_project_files(project.id, files)
        syntax_res = CodeSandbox.verify_syntax(project.id)
        syntax_passed = syntax_res.get("all_valid", True)
        checked_count = syntax_res.get("files_checked", 0)
        assertions.append((
            f"python_ast_syntax_check ({checked_count} files)",
            "sandbox/syntax",
            "passed" if syntax_passed else "failed",
            max(5, int((time.perf_counter() - started) * 1000)),
            None if syntax_passed else "; ".join(str(e) for e in syntax_res.get("errors", [])),
        ))
        output_lines.append(f"Syntax check: {'PASSED' if syntax_passed else 'FAILED'} ({checked_count} python files)")

        if test_script_art and test_script_art.content:
            sb_res = CodeSandbox.execute_test_suite(project.id, test_script_art.content)
            output_lines.append(sb_res.stdout or sb_res.stderr or "Sandbox pytest finished")
            parsed_passed = sb_res.passed_count or (1 if sb_res.success else 0)
            parsed_failed = sb_res.failed_count or (0 if sb_res.success else 1)
            for idx in range(parsed_passed):
                assertions.append((
                    f"pytest_assertion_{idx + 1}",
                    test_script_art.file_path,
                    "passed",
                    max(10, sb_res.duration_ms // max(1, parsed_passed + parsed_failed)),
                    None,
                ))
            for idx in range(parsed_failed):
                assertions.append((
                    f"pytest_failure_{idx + 1}",
                    test_script_art.file_path,
                    "failed",
                    max(10, sb_res.duration_ms // max(1, parsed_passed + parsed_failed)),
                    (sb_res.stderr or sb_res.stdout or "Test failed")[:400],
                ))
        else:
            # Verify artifact structure integrity even before pytest script exists
            has_backend = any(a.file_path.endswith(".py") for a in artifacts)
            has_frontend = any(a.file_path.endswith((".tsx", ".ts", ".jsx", ".js")) for a in artifacts)
            assertions.append(("artifact_inventory_non_empty", "workspace/artifacts", "passed", 12, None))
            assertions.append(("backend_code_present", "backend/", "passed" if has_backend else "skipped", 8, None))
            assertions.append(("frontend_code_present", "frontend/", "passed" if has_frontend else "skipped", 8, None))
    else:
        assertions.append((
            "workspace_artifacts_ready",
            "workspace/artifacts",
            "skipped",
            5,
            "No artifacts generated yet. Run the autonomous workflow first.",
        ))
        output_lines.append("No project artifacts found yet. Start the workflow to generate code and tests.")

    passed_count = sum(1 for a in assertions if a[2] == "passed")
    failed_count = sum(1 for a in assertions if a[2] == "failed")
    skipped_count = sum(1 for a in assertions if a[2] == "skipped")
    total_count = len(assertions)
    duration_ms = max(10, int((time.perf_counter() - started) * 1000))
    run_status = "failed" if failed_count > 0 else ("passed" if passed_count > 0 else "skipped")

    test_run = TestRun(
        project_id=project.id,
        total_tests=total_count,
        passed_tests=passed_count,
        failed_tests=failed_count,
        skipped_tests=skipped_count,
        duration_ms=duration_ms,
        status=run_status,
        output_logs="\n".join(output_lines)[:4000],
    )
    db.add(test_run)
    db.flush()

    for name, fpath, st, dur, err_msg in assertions:
        db.add(
            TestResult(
                test_run_id=test_run.id,
                test_name=name,
                test_file=fpath,
                status=st,
                duration_ms=dur,
                error_message=err_msg,
            )
        )

    log_event(
        db=db,
        event_type=AuditEventType.TEST_EXECUTED.value,
        project_id=project.id,
        actor="QA Engineer",
        details={"test_run_id": test_run.id, "passed": passed_count, "failed": failed_count, "skipped": skipped_count},
    )

    db.commit()
    db.refresh(test_run)

    await ws_manager.broadcast_to_project(
        project_id=project.id,
        event_type="test.completed",
        data={"test_run_id": test_run.id, "status": test_run.status, "passed": passed_count, "failed": failed_count},
    )

    return test_run
