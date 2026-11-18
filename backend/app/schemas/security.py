from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SecurityFindingResponse(BaseModel):
    id: str
    security_scan_id: str
    severity: str
    title: str
    description: str
    affected_file: Optional[str] = None
    line_number: Optional[int] = None
    cwe_id: Optional[str] = None
    suggested_fix: Optional[str] = None
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SecurityScanResponse(BaseModel):
    id: str
    project_id: str
    execution_id: Optional[str] = None
    task_id: Optional[str] = None
    status: str
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    summary: Optional[str] = None
    findings: List[SecurityFindingResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

