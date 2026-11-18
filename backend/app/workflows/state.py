"""LangGraph workflow state structure."""

from typing import Any, Dict, List, Optional, TypedDict


class WorkflowState(TypedDict):
    project_id: str
    workflow_id: str
    project_name: str
    idea: str
    current_step: str
    execution_plan: Dict[str, Any]
    prd: Dict[str, Any]
    architecture: Dict[str, Any]
    backend_files: List[Dict[str, str]]
    frontend_files: List[Dict[str, str]]
    code_review: Dict[str, Any]
    qa_results: Dict[str, Any]
    security_report: Dict[str, Any]
    documentation_files: List[Dict[str, str]]
    retry_counts: Dict[str, int]
    needs_approval: bool
    is_approved: bool
    status: str
    logs: List[str]

