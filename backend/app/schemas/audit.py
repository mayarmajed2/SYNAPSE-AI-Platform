from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AuditLogCreate(BaseModel):
    event_type: str
    project_id: Optional[str] = None
    actor: str = "System"
    details: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: str
    event_type: str
    project_id: Optional[str] = None
    actor: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

