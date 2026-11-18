import datetime
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

# Cross-platform JSON type: native JSONB on PostgreSQL, standard JSON on SQLite
JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.database import Base
from app.db.enums import (
    AgentRole,
    AgentStatus,
    ApprovalStatus,
    ArtifactType,
    AuditEventType,
    NodeStatus,
    ProjectStatus,
    RiskLevel,
    SeverityLevel,
    TaskPriority,
    TaskStatus,
    WorkflowStatus,
)


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    owner = relationship("User", back_populates="workspaces")
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    idea = Column(Text, nullable=False)
    project_type = Column(String(100), default="Full-Stack Web App", nullable=False)
    complexity = Column(String(50), default="Medium", nullable=False)
    tech_stack = Column(JSON_TYPE, default=dict, nullable=False)
    status = Column(String(50), default=ProjectStatus.DRAFT.value, nullable=False, index=True)
    execution_progress = Column(Integer, default=0, nullable=False)
    mvp_scope = Column(JSON_TYPE, default=dict, nullable=False)
    metadata_json = Column(JSON_TYPE, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    workspace = relationship("Workspace", back_populates="projects")
    workflows = relationship("Workflow", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="project", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
    security_scans = relationship("SecurityScan", back_populates="project", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")
    llm_usage = relationship("LLMUsageRecord", back_populates="project", cascade="all, delete-orphan")
    messages = relationship("AgentMessage", back_populates="project", cascade="all, delete-orphan")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    role = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    system_prompt = Column(Text, nullable=False)
    avatar_url = Column(String(255), nullable=True)
    status = Column(String(50), default=AgentStatus.IDLE.value, nullable=False, index=True)
    current_task = Column(String(255), nullable=True)
    success_rate = Column(Float, default=100.0, nullable=False)
    completed_tasks = Column(Integer, default=0, nullable=False)
    total_tasks = Column(Integer, default=0, nullable=False)
    avg_execution_time_ms = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    tasks = relationship("Task", back_populates="assigned_agent")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=WorkflowStatus.PENDING.value, nullable=False, index=True)
    current_step = Column(String(100), default="initialization", nullable=False)
    total_steps = Column(Integer, default=0, nullable=False)
    execution_plan = Column(JSON_TYPE, default=list, nullable=False)
    config = Column(JSON_TYPE, default=dict, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project", back_populates="workflows")
    nodes = relationship("WorkflowNode", back_populates="workflow", cascade="all, delete-orphan")
    edges = relationship("WorkflowEdge", back_populates="workflow", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="workflow", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="workflow", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowNode(Base):
    __tablename__ = "workflow_nodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    node_key = Column(String(100), nullable=False, index=True)
    agent_role = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default=NodeStatus.PENDING.value, nullable=False, index=True)
    position_x = Column(Float, default=0.0, nullable=False)
    position_y = Column(Float, default=0.0, nullable=False)
    config = Column(JSON_TYPE, default=dict, nullable=False)
    duration_ms = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="nodes")


class WorkflowEdge(Base):
    __tablename__ = "workflow_edges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    edge_key = Column(String(100), nullable=False)
    source_node_id = Column(String(100), nullable=False, index=True)
    target_node_id = Column(String(100), nullable=False, index=True)
    edge_type = Column(String(50), default="default", nullable=False)
    condition = Column(Text, nullable=True)
    animated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="edges")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_agent_id = Column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default=TaskStatus.PENDING.value, nullable=False, index=True)
    priority = Column(String(50), default=TaskPriority.MEDIUM.value, nullable=False)
    input_data = Column(JSON_TYPE, default=dict, nullable=False)
    output_data = Column(JSON_TYPE, default=dict, nullable=False)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    parent_task_id = Column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    dependencies = Column(JSON_TYPE, default=list, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project", back_populates="tasks")
    workflow = relationship("Workflow", back_populates="tasks")
    assigned_agent = relationship("Agent", back_populates="tasks")
    artifacts = relationship("Artifact", back_populates="task", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="task", cascade="all, delete-orphan")


class Execution(Base):
    __tablename__ = "executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_type = Column(String(50), default="manual", nullable=False)
    status = Column(String(50), default=WorkflowStatus.PENDING.value, nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=True)
    logs = Column(JSON_TYPE, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="executions")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    workflow_id = Column(String(36), nullable=True, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    sender_role = Column(String(50), nullable=False, index=True)
    recipient_role = Column(String(50), nullable=False, index=True)
    message_type = Column(String(50), default="directive", nullable=False)
    content = Column(Text, nullable=False)
    payload = Column(JSON_TYPE, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    project = relationship("Project", back_populates="messages")


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    file_path = Column(String(500), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    artifact_type = Column(String(50), default=ArtifactType.OTHER.value, nullable=False, index=True)
    content = Column(Text, nullable=False)
    language = Column(String(50), default="text", nullable=False)
    version = Column(Integer, default=1, nullable=False)
    size_bytes = Column(Integer, default=0, nullable=False)
    is_current = Column(Boolean, default=True, nullable=False)
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project", back_populates="artifacts")
    task = relationship("Task", back_populates="artifacts")


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_id = Column(String(36), nullable=True, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    total_tests = Column(Integer, default=0, nullable=False)
    passed_tests = Column(Integer, default=0, nullable=False)
    failed_tests = Column(Integer, default=0, nullable=False)
    skipped_tests = Column(Integer, default=0, nullable=False)
    duration_ms = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="pending", nullable=False, index=True)
    output_logs = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    project = relationship("Project", back_populates="test_runs")
    results = relationship("TestResult", back_populates="test_run", cascade="all, delete-orphan")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    test_run_id = Column(String(36), ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(255), nullable=False)
    test_file = Column(String(500), nullable=False)
    status = Column(String(50), default="passed", nullable=False)
    duration_ms = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    test_run = relationship("TestRun", back_populates="results")


class SecurityScan(Base):
    __tablename__ = "security_scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_id = Column(String(36), nullable=True, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    status = Column(String(50), default="completed", nullable=False, index=True)
    total_vulnerabilities = Column(Integer, default=0, nullable=False)
    critical_count = Column(Integer, default=0, nullable=False)
    high_count = Column(Integer, default=0, nullable=False)
    medium_count = Column(Integer, default=0, nullable=False)
    low_count = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    project = relationship("Project", back_populates="security_scans")
    findings = relationship("SecurityFinding", back_populates="security_scan", cascade="all, delete-orphan")


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    security_scan_id = Column(String(36), ForeignKey("security_scans.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(50), default=SeverityLevel.MEDIUM.value, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    affected_file = Column(String(500), nullable=True)
    line_number = Column(Integer, nullable=True)
    cwe_id = Column(String(50), nullable=True)
    suggested_fix = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    security_scan = relationship("SecurityScan", back_populates="findings")


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True, index=True)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(50), default=RiskLevel.MEDIUM.value, nullable=False)
    status = Column(String(50), default=ApprovalStatus.PENDING.value, nullable=False, index=True)
    requested_by = Column(String(100), default="Supervisor Agent", nullable=False)
    resolved_by = Column(String(100), nullable=True)
    decision = Column(String(50), nullable=True)
    comments = Column(Text, nullable=True)
    metadata_json = Column(JSON_TYPE, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="approvals")
    workflow = relationship("Workflow", back_populates="approvals")
    task = relationship("Task", back_populates="approvals")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    actor = Column(String(100), nullable=False)
    details = Column(JSON_TYPE, default=dict, nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    project = relationship("Project", back_populates="audit_logs")


class LLMUsageRecord(Base):
    __tablename__ = "llm_usage_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_id = Column(String(36), nullable=True, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    provider = Column(String(50), default="groq", nullable=False)
    model = Column(String(100), nullable=False)
    prompt_tokens = Column(Integer, default=0, nullable=False)
    completion_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    estimated_cost_usd = Column(Float, default=0.0, nullable=False)
    is_success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    project = relationship("Project", back_populates="llm_usage")

