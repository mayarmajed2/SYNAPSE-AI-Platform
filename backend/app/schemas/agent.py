from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AgentBase(BaseModel):
    name: str = Field(..., max_length=100)
    role: str = Field(..., max_length=50)
    description: str
    system_prompt: str
    avatar_url: Optional[str] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    avatar_url: Optional[str] = None
    status: Optional[str] = None
    current_task: Optional[str] = None


class AgentResponse(AgentBase):
    id: str
    status: str
    current_task: Optional[str] = None
    success_rate: float
    completed_tasks: int
    total_tasks: int
    avg_execution_time_ms: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

