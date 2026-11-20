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
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    state = GitService.get_repo_state(project_id)
    return state.get("commits", [])


@router.get("/project/{project_id}/pull-requests")
def list_pull_requests(project_id: str, db: Session = Depends(get_db)):
    """List Pull Requests for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
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
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
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


class GitHubPushRequest(BaseModel):
    repository: str  # format: "owner/repo"
    branch: str = "main"
    github_token: Optional[str] = None
    commit_message: str = "feat(synapse): push autonomous generated codebase"


@router.post("/project/{project_id}/push-github")
async def push_project_to_github(
    project_id: str,
    payload: GitHubPushRequest,
    db: Session = Depends(get_db),
):
    """Push generated project artifacts to a real GitHub repository via GitHub Contents API."""
    import base64
    import httpx
    from app.core.config import settings as app_settings
    from app.db.models import Artifact

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    token = (payload.github_token or app_settings.GITHUB_TOKEN or "").strip()
    if not token:
        raise HTTPException(
            status_code=400,
            detail="GitHub Personal Access Token required. Provide one in the modal or set GITHUB_TOKEN in backend/.env.",
        )

    if "/" not in payload.repository or len(payload.repository.split("/")) != 2:
        raise HTTPException(status_code=400, detail="Repository must be formatted as 'owner/repo'")

    artifacts = (
        db.query(Artifact)
        .filter(Artifact.project_id == project.id, Artifact.is_current == True)
        .all()
    )
    if not artifacts:
        raise HTTPException(status_code=400, detail="No generated artifacts found for this project yet.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    pushed = []
    errors = []
    async with httpx.AsyncClient(timeout=20.0) as client:
        for art in artifacts[:25]:
            clean_path = (art.file_path or "").replace("\\", "/").lstrip("/")
            if not clean_path or ".." in clean_path.split("/"):
                continue
            url = f"https://api.github.com/repos/{payload.repository}/contents/{clean_path}"
            # Check if file already exists to obtain its SHA
            sha = None
            existing = await client.get(url, headers=headers, params={"ref": payload.branch})
            if existing.status_code == 200:
                sha = existing.json().get("sha")
            body = {
                "message": f"{payload.commit_message} ({clean_path})",
                "content": base64.b64encode((art.content or "").encode("utf-8")).decode("ascii"),
                "branch": payload.branch,
            }
            if sha:
                body["sha"] = sha
            put_res = await client.put(url, headers=headers, json=body)
            if put_res.status_code in (200, 201):
                pushed.append(clean_path)
            else:
                errors.append({"file": clean_path, "status": put_res.status_code, "error": put_res.text[:160]})

    if not pushed and errors:
        raise HTTPException(status_code=502, detail=f"GitHub push failed: {errors[0]['error']}")

    return {
        "repository": payload.repository,
        "branch": payload.branch,
        "pushed_files": len(pushed),
        "files": pushed,
        "errors": errors,
        "url": f"https://github.com/{payload.repository}",
    }

