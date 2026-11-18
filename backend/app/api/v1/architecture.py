"""Architecture Intelligence API Router."""

import json
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Artifact, Project
from app.services.architecture_service import ArchitectureService

router = APIRouter(prefix="/architecture", tags=["Architecture Intelligence"])


@router.get("/project/{project_id}")
def get_project_architecture(project_id: str, db: Session = Depends(get_db)):
    """Retrieve deep system architecture topology, component relations, DB schemas, and ADRs."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Find ARCHITECTURE.json artifact
    arch_artifact = (
        db.query(Artifact)
        .filter(Artifact.project_id == project_id, Artifact.file_name == "ARCHITECTURE.json")
        .first()
    )

    arch_data = {}
    if arch_artifact and arch_artifact.content:
        try:
            arch_data = json.loads(arch_artifact.content)
        except Exception:
            pass

    # If no artifact exists, fallback to project tech_stack
    if not arch_data:
        arch_data = {
            "tech_stack": project.tech_stack or {},
            "architecture_overview": f"Decoupled Microservice Topology for {project.name}",
        }

    return ArchitectureService.analyze_architecture(project.name, arch_data)

