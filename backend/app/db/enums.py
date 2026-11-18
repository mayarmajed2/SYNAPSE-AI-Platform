import enum


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    REVIEW = "review"
    TESTING = "testing"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class AgentRole(str, enum.Enum):
    SUPERVISOR = "supervisor"
    PRODUCT_MANAGER = "product_manager"
    SYSTEM_ARCHITECT = "system_architect"
    FRONTEND_DEVELOPER = "frontend_developer"
    BACKEND_DEVELOPER = "backend_developer"
    CODE_REVIEWER = "code_reviewer"
    QA_ENGINEER = "qa_engineer"
    SECURITY_AGENT = "security_agent"
    DOCUMENTATION_AGENT = "documentation_agent"
    DEPLOYMENT_AGENT = "deployment_agent"


class AgentStatus(str, enum.Enum):
    IDLE = "idle"
    WORKING = "working"
    WAITING = "waiting"
    REVIEWING = "reviewing"
    FAILED = "failed"
    OFFLINE = "offline"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    WAITING_APPROVAL = "waiting_approval"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WorkflowStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    WAITING_APPROVAL = "waiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NodeStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    WAITING_APPROVAL = "waiting_approval"
    SKIPPED = "skipped"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class SeverityLevel(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ArtifactType(str, enum.Enum):
    REQUIREMENT = "requirement"
    ARCHITECTURE = "architecture"
    CODE_FRONTEND = "code_frontend"
    CODE_BACKEND = "code_backend"
    DATABASE_SCHEMA = "database_schema"
    TEST_SCRIPT = "test_script"
    SECURITY_REPORT = "security_report"
    DOCUMENTATION = "documentation"
    DEPLOYMENT = "deployment"
    PULL_REQUEST = "pull_request"
    ADR = "adr"
    REPORT = "report"
    CONFIG = "config"
    OTHER = "other"


class AuditEventType(str, enum.Enum):
    PROJECT_CREATED = "project.created"
    PROJECT_UPDATED = "project.updated"
    PROJECT_ARCHIVED = "project.archived"
    WORKFLOW_STARTED = "workflow.started"
    WORKFLOW_PAUSED = "workflow.paused"
    WORKFLOW_RESUMED = "workflow.resumed"
    WORKFLOW_COMPLETED = "workflow.completed"
    WORKFLOW_FAILED = "workflow.failed"
    AGENT_ASSIGNED = "agent.assigned"
    AGENT_STATUS_CHANGED = "agent.status_changed"
    TASK_CREATED = "task.created"
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    TEST_EXECUTED = "test.executed"
    SECURITY_SCAN_COMPLETED = "security.scan_completed"
    APPROVAL_REQUESTED = "approval.requested"
    APPROVAL_GRANTED = "approval.granted"
    APPROVAL_REJECTED = "approval.rejected"
    PROJECT_DELIVERED = "project.delivered"
    SETTING_CHANGED = "setting.changed"

