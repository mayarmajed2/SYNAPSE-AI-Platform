from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    priority: str = Field("medium", description="low, medium, high, critical")
    assigned_agent_id: Optional[str] = None
    input_data: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)


class TaskCreate(TaskBase):
    project_id: str
    workflow_id: Optional[str] = None
    max_retries: int = Field(3, ge=0, le=10)


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    retry_count: Optional[int] = None


class TaskResponse(TaskBase):
    id: str
    project_id: str
    workflow_id: Optional[str] = None
    status: str
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    retry_count: int
    max_retries: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

