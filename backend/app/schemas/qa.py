from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class TestResultResponse(BaseModel):
    id: str
    test_run_id: str
    test_name: str
    test_file: str
    status: str
    duration_ms: int
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TestRunResponse(BaseModel):
    id: str
    project_id: str
    execution_id: Optional[str] = None
    task_id: Optional[str] = None
    total_tests: int
    passed_tests: int
    failed_tests: int
    skipped_tests: int
    duration_ms: int
    status: str
    output_logs: Optional[str] = None
    results: List[TestResultResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

