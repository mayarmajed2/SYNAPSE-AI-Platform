from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ArtifactBase(BaseModel):
    file_path: str = Field(..., max_length=500)
    file_name: str = Field(..., max_length=255)
    artifact_type: str = Field("other")
    content: str
    language: str = "text"
    version: int = 1
    size_bytes: int = 0
    is_current: bool = True
    checksum: Optional[str] = None


class ArtifactCreate(ArtifactBase):
    project_id: str
    task_id: Optional[str] = None


class ArtifactResponse(ArtifactBase):
    id: str
    project_id: str
    task_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArtifactTreeItem(BaseModel):
    id: str
    file_path: str
    file_name: str
    artifact_type: str
    language: str
    size_bytes: int
    updated_at: datetime

