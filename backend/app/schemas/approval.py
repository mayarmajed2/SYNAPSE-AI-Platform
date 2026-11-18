from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ApprovalResolveRequest(BaseModel):
    decision: str = Field(..., description="'approved' or 'rejected'")
    comments: Optional[str] = None
    resolver_name: str = Field("User Admin", description="Name or role of approver")


class ApprovalResponse(BaseModel):
    id: str
    project_id: str
    workflow_id: Optional[str] = None
    task_id: Optional[str] = None
    title: str
    description: str
    risk_level: str
    status: str
    requested_by: str
    resolved_by: Optional[str] = None
    decision: Optional[str] = None
    comments: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

