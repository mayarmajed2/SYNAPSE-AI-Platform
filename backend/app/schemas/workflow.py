from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class WorkflowNodeSchema(BaseModel):
    id: str
    node_key: str
    agent_role: str
    title: str
    status: str
    position_x: float
    position_y: float
    config: Dict[str, Any] = Field(default_factory=dict)
    duration_ms: int = 0
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowEdgeSchema(BaseModel):
    id: str
    edge_key: str
    source_node_id: str
    target_node_id: str
    edge_type: str = "default"
    condition: Optional[str] = None
    animated: bool = False

    class Config:
        from_attributes = True


class WorkflowResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    status: str
    current_step: str
    total_steps: int
    execution_plan: List[Dict[str, Any]] = Field(default_factory=list)
    config: Dict[str, Any] = Field(default_factory=dict)
    nodes: List[WorkflowNodeSchema] = Field(default_factory=list)
    edges: List[WorkflowEdgeSchema] = Field(default_factory=list)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowStartRequest(BaseModel):
    custom_instructions: Optional[str] = None
    require_approval_points: List[str] = Field(default_factory=list)
    max_retries_per_task: int = Field(3, ge=1, le=5)

