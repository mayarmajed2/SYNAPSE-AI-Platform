from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OverviewAnalytics(BaseModel):
    total_projects: int = 0
    active_projects: int = 0
    completed_projects: int = 0
    total_agent_executions: int = 0
    success_rate: float = 0.0
    average_execution_time_seconds: float = 0.0
    total_tokens_consumed: int = 0
    estimated_ai_cost_usd: float = 0.0


class AgentWorkloadMetric(BaseModel):
    agent_id: str
    name: str
    role: str
    avatar_url: Optional[str] = None
    status: str
    total_tasks: int
    completed_tasks: int
    success_rate: float
    avg_execution_time_ms: int


class ProjectActivityMetric(BaseModel):
    project_id: str
    project_name: str
    status: str
    execution_progress: int
    total_tasks: int
    completed_tasks: int
    total_tokens: int
    estimated_cost: float


class UsageMetric(BaseModel):
    model: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
    call_count: int

