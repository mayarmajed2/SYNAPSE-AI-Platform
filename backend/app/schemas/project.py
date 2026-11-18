from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: Optional[str] = Field(None, description="Detailed project description")
    idea: str = Field(..., min_length=5, description="Natural language project concept or user idea")
    project_type: str = Field("Full-Stack Web App", description="Web App, API, Mobile, SaaS, etc.")
    complexity: str = Field("Medium", description="Low, Medium, High, Enterprise")
    tech_stack: Dict[str, Any] = Field(default_factory=dict, description="Chosen technical frameworks and databases")


class ProjectCreate(ProjectBase):
    workspace_id: Optional[str] = None
    require_approval_before_dev: bool = Field(False, description="Require human sign-off on architecture before code gen")


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    complexity: Optional[str] = None
    execution_progress: Optional[int] = Field(None, ge=0, le=100)
    tech_stack: Optional[Dict[str, Any]] = None
    mvp_scope: Optional[Dict[str, Any]] = None


class ProjectResponse(ProjectBase):
    id: str
    workspace_id: Optional[str] = None
    slug: str
    status: str
    execution_progress: int
    mvp_scope: Dict[str, Any] = Field(default_factory=dict)
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    id: str
    name: str
    slug: str
    idea: str
    project_type: str
    status: str
    execution_progress: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

