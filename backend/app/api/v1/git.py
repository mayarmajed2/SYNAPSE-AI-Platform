"""Git & Pull Requests API Router."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project
from app.services.git_service import GitService

router = APIRouter(prefix="/git", tags=["Git & Pull Requests"])


class PullRequestCreate(BaseModel):
    title: str
    description: str
    source_branch: str
    target_branch: str = "main"


class PullRequestReview(BaseModel):
    decision: str  # approved, rejected
    comment: str
    reviewer: str = "Principal Engineer"


@router.get("/project/{project_id}")
def get_repository_status(project_id: str, db: Session = Depends(get_db)):
    """Fetch repository branches, commits, and Pull Requests."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return GitService.get_repo_state(project_id)


@router.get("/project/{project_id}/commits")
def list_commits(project_id: str, db: Session = Depends(get_db)):
    """List commit history authored by agents."""
    state = GitService.get_repo_state(project_id)
    return state.get("commits", [])


@router.get("/project/{project_id}/pull-requests")
def list_pull_requests(project_id: str, db: Session = Depends(get_db)):
    """List Pull Requests for a project."""
    state = GitService.get_repo_state(project_id)
    return state.get("pull_requests", [])


@router.post("/project/{project_id}/pull-requests", status_code=status.HTTP_201_CREATED)
def create_pull_request(project_id: str, payload: PullRequestCreate, db: Session = Depends(get_db)):
    """Open a new Pull Request."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    pr = GitService.create_pull_request(
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        source_branch=payload.source_branch,
        target_branch=payload.target_branch,
    )
    return pr


@router.post("/project/{project_id}/pull-requests/{pr_id}/merge")
def merge_pull_request(project_id: str, pr_id: int, db: Session = Depends(get_db)):
    """Merge an open Pull Request."""
    try:
        return GitService.merge_pull_request(project_id, pr_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/diff")
def get_file_diff(
    old_content: str = Query(""),
    new_content: str = Query(""),
    filename: str = Query("file.txt"),
):
    """Generate side-by-side / unified diff representation."""
    diff_text = GitService.compute_file_diff(old_content, new_content, filename)
    return {"filename": filename, "diff": diff_text}

