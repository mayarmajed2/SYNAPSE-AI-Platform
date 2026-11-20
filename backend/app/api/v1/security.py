from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.enums import AuditEventType
from app.db.models import Artifact, Project, SecurityFinding, SecurityScan
from app.schemas.security import SecurityScanResponse
from app.services.audit import log_event
from app.services.sast_scanner import scan_artifacts
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/security", tags=["Security Center"])


@router.get("/project/{project_id}", response_model=List[SecurityScanResponse])
def list_project_security_scans(project_id: str, db: Session = Depends(get_db)):
    """List historical security audits and vulnerability scans for a project."""
    scans = (
        db.query(SecurityScan)
        .filter(SecurityScan.project_id == project_id)
        .order_by(SecurityScan.created_at.desc())
        .all()
    )
    return scans


@router.get("/scans/{scan_id}", response_model=SecurityScanResponse)
def get_security_scan(scan_id: str, db: Session = Depends(get_db)):
    """Retrieve security scan findings, severity levels, and suggested remedies."""
    scan = db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Security scan not found")
    return scan


@router.post("/project/{project_id}/execute", response_model=SecurityScanResponse)
async def execute_project_security_scan(project_id: str, db: Session = Depends(get_db)):
    """Run real static SAST analysis across the project's stored codebase artifacts."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifacts = (
        db.query(Artifact)
        .filter(Artifact.project_id == project.id, Artifact.is_current == True)
        .all()
    )
    artifact_dicts = [{"file_path": a.file_path, "content": a.content or ""} for a in artifacts]
    result = scan_artifacts(artifact_dicts)

    scan = SecurityScan(
        project_id=project.id,
        status="completed",
        total_vulnerabilities=result["total_vulnerabilities"],
        critical_count=result["critical_count"],
        high_count=result["high_count"],
        medium_count=result["medium_count"],
        low_count=result["low_count"],
        summary=result["summary"],
    )
    db.add(scan)
    db.flush()

    for f in result["findings"]:
        db.add(
            SecurityFinding(
                security_scan_id=scan.id,
                severity=f["severity"],
                title=f["title"],
                description=f["description"],
                affected_file=f["affected_file"],
                line_number=f["line_number"],
                cwe_id=f["cwe_id"],
                suggested_fix=f["suggested_fix"],
                is_resolved=False,
            )
        )

    log_event(
        db=db,
        event_type=AuditEventType.SECURITY_SCAN_COMPLETED.value,
        project_id=project.id,
        actor="Security Agent",
        details={
            "scan_id": scan.id,
            "artifacts_scanned": len(artifacts),
            "vulnerabilities": result["total_vulnerabilities"],
            "critical": result["critical_count"],
            "high": result["high_count"],
        },
    )

    db.commit()
    db.refresh(scan)

    await ws_manager.broadcast_to_project(
        project_id=project.id,
        event_type="security.completed",
        data={
            "scan_id": scan.id,
            "status": scan.status,
            "vulnerabilities": scan.total_vulnerabilities,
        },
    )

    return scan
