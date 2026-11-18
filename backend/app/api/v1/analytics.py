from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Agent, LLMUsageRecord, Project, Task
from app.schemas.analytics import AgentWorkloadMetric, OverviewAnalytics, ProjectActivityMetric, UsageMetric

router = APIRouter(prefix="/analytics", tags=["Analytics & Observability"])


@router.get("/overview", response_model=OverviewAnalytics)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Retrieve high-level executive analytics and AI engineering metrics."""
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status.in_(["planning", "in_progress", "review", "testing"])).count()
    completed_projects = db.query(Project).filter(Project.status == "completed").count()

    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "completed").count()
    success_rate = (completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 100.0

    # Total tokens and costs from real usage records
    token_stats = db.query(
        func.coalesce(func.sum(LLMUsageRecord.total_tokens), 0).label("tokens"),
        func.coalesce(func.sum(LLMUsageRecord.estimated_cost_usd), 0.0).label("cost"),
        func.coalesce(func.avg(LLMUsageRecord.latency_ms), 0.0).label("avg_latency"),
    ).first()

    total_tokens = int(token_stats.tokens) if token_stats else 0
    total_cost = float(token_stats.cost) if token_stats else 0.0
    avg_latency_s = float(token_stats.avg_latency) / 1000.0 if token_stats and token_stats.avg_latency else 1.85

    return OverviewAnalytics(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_projects=completed_projects,
        total_agent_executions=total_tasks,
        success_rate=round(success_rate, 1),
        average_execution_time_seconds=round(avg_latency_s, 2),
        total_tokens_consumed=total_tokens,
        estimated_ai_cost_usd=round(total_cost, 4),
    )


@router.get("/agents", response_model=List[AgentWorkloadMetric])
def get_agents_workload(db: Session = Depends(get_db)):
    """Retrieve workload, completed tasks, and performance for each agent."""
    agents = db.query(Agent).order_by(Agent.name.asc()).all()
    return [
        AgentWorkloadMetric(
            agent_id=a.id,
            name=a.name,
            role=a.role,
            avatar_url=a.avatar_url,
            status=a.status,
            total_tasks=a.total_tasks,
            completed_tasks=a.completed_tasks,
            success_rate=a.success_rate,
            avg_execution_time_ms=a.avg_execution_time_ms,
        )
        for a in agents
    ]


@router.get("/usage", response_model=List[UsageMetric])
def get_usage_metrics(db: Session = Depends(get_db)):
    """Retrieve LLM model consumption, tokens, and estimated cost."""
    records = (
        db.query(
            LLMUsageRecord.model,
            LLMUsageRecord.provider,
            func.sum(LLMUsageRecord.prompt_tokens).label("prompt_tokens"),
            func.sum(LLMUsageRecord.completion_tokens).label("completion_tokens"),
            func.sum(LLMUsageRecord.total_tokens).label("total_tokens"),
            func.sum(LLMUsageRecord.estimated_cost_usd).label("cost"),
            func.count(LLMUsageRecord.id).label("call_count"),
        )
        .group_by(LLMUsageRecord.model, LLMUsageRecord.provider)
        .all()
    )

    metrics = []
    for r in records:
        metrics.append(
            UsageMetric(
                model=r.model,
                provider=r.provider,
                prompt_tokens=int(r.prompt_tokens or 0),
                completion_tokens=int(r.completion_tokens or 0),
                total_tokens=int(r.total_tokens or 0),
                cost_usd=float(r.cost or 0.0),
                call_count=int(r.call_count or 0),
            )
        )

    # If no calls recorded yet, return default Groq models breakdown with 0
    if not metrics:
        metrics = [
            UsageMetric(
                model="llama-3.3-70b-versatile",
                provider="groq",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                cost_usd=0.0,
                call_count=0,
            ),
            UsageMetric(
                model="llama-3.1-8b-instant",
                provider="groq",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                cost_usd=0.0,
                call_count=0,
            ),
        ]

    return metrics

