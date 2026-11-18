from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Agent, Task
from app.schemas.agent import AgentResponse, AgentUpdate
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    """List all specialized AI workforce agents with live execution statistics."""
    agents = db.query(Agent).order_by(Agent.name.asc()).all()
    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed agent profile and metrics."""
    agent = db.query(Agent).filter((Agent.id == agent_id) | (Agent.role == agent_id)).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, data: AgentUpdate, db: Session = Depends(get_db)):
    """Update agent configuration or operational status."""
    agent = db.query(Agent).filter((Agent.id == agent_id) | (Agent.role == agent_id)).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(agent, field, val)

    db.commit()
    db.refresh(agent)
    return agent


@router.get("/{agent_id}/tasks", response_model=List[TaskResponse])
def get_agent_task_history(agent_id: str, db: Session = Depends(get_db)):
    """Retrieve all historical tasks assigned to this agent."""
    agent = db.query(Agent).filter((Agent.id == agent_id) | (Agent.role == agent_id)).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    tasks = db.query(Task).filter(Task.assigned_agent_id == agent.id).order_by(Task.created_at.desc()).limit(50).all()
    return tasks

