"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-03 16:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Workspaces
    op.create_table(
        'workspaces',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workspaces_slug'), 'workspaces', ['slug'], unique=True)

    # 3. Projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('idea', sa.Text(), nullable=False),
        sa.Column('project_type', sa.String(length=100), nullable=False, server_default='Full-Stack Web App'),
        sa.Column('complexity', sa.String(length=50), nullable=False, server_default='Medium'),
        sa.Column('tech_stack', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('execution_progress', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('mvp_scope', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_created_at'), 'projects', ['created_at'], unique=False)
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=False)
    op.create_index(op.f('ix_projects_slug'), 'projects', ['slug'], unique=False)
    op.create_index(op.f('ix_projects_status'), 'projects', ['status'], unique=False)
    op.create_index(op.f('ix_projects_workspace_id'), 'projects', ['workspace_id'], unique=False)

    # 4. Agents
    op.create_table(
        'agents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('system_prompt', sa.Text(), nullable=False),
        sa.Column('avatar_url', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='idle'),
        sa.Column('current_task', sa.String(length=255), nullable=True),
        sa.Column('success_rate', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('completed_tasks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tasks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('avg_execution_time_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agents_role'), 'agents', ['role'], unique=True)
    op.create_index(op.f('ix_agents_status'), 'agents', ['status'], unique=False)

    # 5. Workflows
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('current_step', sa.String(length=100), nullable=False, server_default='initialization'),
        sa.Column('total_steps', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('execution_plan', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflows_project_id'), 'workflows', ['project_id'], unique=False)
    op.create_index(op.f('ix_workflows_status'), 'workflows', ['status'], unique=False)

    # 6. Workflow Nodes
    op.create_table(
        'workflow_nodes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('node_key', sa.String(length=100), nullable=False),
        sa.Column('agent_role', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('position_x', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('position_y', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('duration_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflow_nodes_node_key'), 'workflow_nodes', ['node_key'], unique=False)
    op.create_index(op.f('ix_workflow_nodes_status'), 'workflow_nodes', ['status'], unique=False)
    op.create_index(op.f('ix_workflow_nodes_workflow_id'), 'workflow_nodes', ['workflow_id'], unique=False)

    # 7. Workflow Edges
    op.create_table(
        'workflow_edges',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('edge_key', sa.String(length=100), nullable=False),
        sa.Column('source_node_id', sa.String(length=100), nullable=False),
        sa.Column('target_node_id', sa.String(length=100), nullable=False),
        sa.Column('edge_type', sa.String(length=50), nullable=False, server_default='default'),
        sa.Column('condition', sa.Text(), nullable=True),
        sa.Column('animated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflow_edges_source_node_id'), 'workflow_edges', ['source_node_id'], unique=False)
    op.create_index(op.f('ix_workflow_edges_target_node_id'), 'workflow_edges', ['target_node_id'], unique=False)
    op.create_index(op.f('ix_workflow_edges_workflow_id'), 'workflow_edges', ['workflow_id'], unique=False)

    # 8. Tasks
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=True),
        sa.Column('assigned_agent_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('input_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('output_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_retries', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('parent_task_id', sa.String(length=36), nullable=True),
        sa.Column('dependencies', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assigned_agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['parent_task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_assigned_agent_id'), 'tasks', ['assigned_agent_id'], unique=False)
    op.create_index(op.f('ix_tasks_created_at'), 'tasks', ['created_at'], unique=False)
    op.create_index(op.f('ix_tasks_project_id'), 'tasks', ['project_id'], unique=False)
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False)
    op.create_index(op.f('ix_tasks_workflow_id'), 'tasks', ['workflow_id'], unique=False)

    # 9. Executions
    op.create_table(
        'executions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('trigger_type', sa.String(length=50), nullable=False, server_default='manual'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('logs', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_executions_project_id'), 'executions', ['project_id'], unique=False)
    op.create_index(op.f('ix_executions_status'), 'executions', ['status'], unique=False)
    op.create_index(op.f('ix_executions_workflow_id'), 'executions', ['workflow_id'], unique=False)

    # 10. Agent Messages
    op.create_table(
        'agent_messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=True),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('sender_role', sa.String(length=50), nullable=False),
        sa.Column('recipient_role', sa.String(length=50), nullable=False),
        sa.Column('message_type', sa.String(length=50), nullable=False, server_default='directive'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_messages_created_at'), 'agent_messages', ['created_at'], unique=False)
    op.create_index(op.f('ix_agent_messages_project_id'), 'agent_messages', ['project_id'], unique=False)
    op.create_index(op.f('ix_agent_messages_recipient_role'), 'agent_messages', ['recipient_role'], unique=False)
    op.create_index(op.f('ix_agent_messages_sender_role'), 'agent_messages', ['sender_role'], unique=False)
    op.create_index(op.f('ix_agent_messages_task_id'), 'agent_messages', ['task_id'], unique=False)
    op.create_index(op.f('ix_agent_messages_workflow_id'), 'agent_messages', ['workflow_id'], unique=False)

    # 11. Artifacts
    op.create_table(
        'artifacts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('artifact_type', sa.String(length=50), nullable=False, server_default='other'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=50), nullable=False, server_default='text'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('size_bytes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('checksum', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_artifacts_artifact_type'), 'artifacts', ['artifact_type'], unique=False)
    op.create_index(op.f('ix_artifacts_file_path'), 'artifacts', ['file_path'], unique=False)
    op.create_index(op.f('ix_artifacts_project_id'), 'artifacts', ['project_id'], unique=False)
    op.create_index(op.f('ix_artifacts_task_id'), 'artifacts', ['task_id'], unique=False)

    # 12. Test Runs
    op.create_table(
        'test_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('execution_id', sa.String(length=36), nullable=True),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('total_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('passed_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('skipped_tests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('duration_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('output_logs', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_runs_created_at'), 'test_runs', ['created_at'], unique=False)
    op.create_index(op.f('ix_test_runs_execution_id'), 'test_runs', ['execution_id'], unique=False)
    op.create_index(op.f('ix_test_runs_project_id'), 'test_runs', ['project_id'], unique=False)
    op.create_index(op.f('ix_test_runs_status'), 'test_runs', ['status'], unique=False)
    op.create_index(op.f('ix_test_runs_task_id'), 'test_runs', ['task_id'], unique=False)

    # 13. Test Results
    op.create_table(
        'test_results',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('test_run_id', sa.String(length=36), nullable=False),
        sa.Column('test_name', sa.String(length=255), nullable=False),
        sa.Column('test_file', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='passed'),
        sa.Column('duration_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('stack_trace', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_results_test_run_id'), 'test_results', ['test_run_id'], unique=False)

    # 14. Security Scans
    op.create_table(
        'security_scans',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('execution_id', sa.String(length=36), nullable=True),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('total_vulnerabilities', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('critical_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('high_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('medium_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('low_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_scans_created_at'), 'security_scans', ['created_at'], unique=False)
    op.create_index(op.f('ix_security_scans_execution_id'), 'security_scans', ['execution_id'], unique=False)
    op.create_index(op.f('ix_security_scans_project_id'), 'security_scans', ['project_id'], unique=False)
    op.create_index(op.f('ix_security_scans_status'), 'security_scans', ['status'], unique=False)
    op.create_index(op.f('ix_security_scans_task_id'), 'security_scans', ['task_id'], unique=False)

    # 15. Security Findings
    op.create_table(
        'security_findings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('security_scan_id', sa.String(length=36), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('affected_file', sa.String(length=500), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('cwe_id', sa.String(length=50), nullable=True),
        sa.Column('suggested_fix', sa.Text(), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['security_scan_id'], ['security_scans.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_findings_security_scan_id'), 'security_findings', ['security_scan_id'], unique=False)
    op.create_index(op.f('ix_security_findings_severity'), 'security_findings', ['severity'], unique=False)

    # 16. Approval Requests
    op.create_table(
        'approval_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=True),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('risk_level', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('requested_by', sa.String(length=100), nullable=False, server_default='Supervisor Agent'),
        sa.Column('resolved_by', sa.String(length=100), nullable=True),
        sa.Column('decision', sa.String(length=50), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_approval_requests_created_at'), 'approval_requests', ['created_at'], unique=False)
    op.create_index(op.f('ix_approval_requests_project_id'), 'approval_requests', ['project_id'], unique=False)
    op.create_index(op.f('ix_approval_requests_status'), 'approval_requests', ['status'], unique=False)
    op.create_index(op.f('ix_approval_requests_task_id'), 'approval_requests', ['task_id'], unique=False)
    op.create_index(op.f('ix_approval_requests_workflow_id'), 'approval_requests', ['workflow_id'], unique=False)

    # 17. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=True),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('actor', sa.String(length=100), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_audit_logs_event_type'), 'audit_logs', ['event_type'], unique=False)
    op.create_index(op.f('ix_audit_logs_project_id'), 'audit_logs', ['project_id'], unique=False)

    # 18. LLM Usage Records
    op.create_table(
        'llm_usage_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('execution_id', sa.String(length=36), nullable=True),
        sa.Column('agent_name', sa.String(length=100), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False, server_default='groq'),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('latency_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('estimated_cost_usd', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_success', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_llm_usage_records_agent_name'), 'llm_usage_records', ['agent_name'], unique=False)
    op.create_index(op.f('ix_llm_usage_records_created_at'), 'llm_usage_records', ['created_at'], unique=False)
    op.create_index(op.f('ix_llm_usage_records_execution_id'), 'llm_usage_records', ['execution_id'], unique=False)
    op.create_index(op.f('ix_llm_usage_records_project_id'), 'llm_usage_records', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_table('llm_usage_records')
    op.drop_table('audit_logs')
    op.drop_table('approval_requests')
    op.drop_table('security_findings')
    op.drop_table('security_scans')
    op.drop_table('test_results')
    op.drop_table('test_runs')
    op.drop_table('artifacts')
    op.drop_table('agent_messages')
    op.drop_table('executions')
    op.drop_table('tasks')
    op.drop_table('workflow_edges')
    op.drop_table('workflow_nodes')
    op.drop_table('workflows')
    op.drop_table('agents')
    op.drop_table('projects')
    op.drop_table('workspaces')
    op.drop_table('users')

