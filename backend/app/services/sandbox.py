"""Secure Code Execution Sandbox Service for SYNAPSE.

Provides isolated workspace directories, restricted process execution, environment sanitization,
automated test running, AST syntax verification, and actionable stack trace diagnostics.
"""

import ast
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

# Root directory for project sandboxes
SANDBOX_ROOT = Path(__file__).resolve().parent.parent.parent / "sandbox_workspaces"
SANDBOX_ROOT.mkdir(exist_ok=True)


class ExecutionResult:
    def __init__(
        self,
        success: bool,
        exit_code: int,
        stdout: str,
        stderr: str,
        duration_ms: int,
        test_results: Optional[Dict[str, Any]] = None,
        diagnostics: Optional[Dict[str, Any]] = None,
    ):
        self.success = success
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr
        self.duration_ms = duration_ms
        self.test_results = test_results or {}
        self.diagnostics = diagnostics or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "exit_code": self.exit_code,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "duration_ms": self.duration_ms,
            "test_results": self.test_results,
            "diagnostics": self.diagnostics,
        }


class CodeSandbox:
    @staticmethod
    def get_workspace_path(project_id: str) -> Path:
        """Get or create isolated filesystem workspace for a project."""
        if not project_id or "/" in project_id or "\\" in project_id or ".." in project_id:
            raise ValueError("Invalid project_id for sandbox workspace")
        root = SANDBOX_ROOT.resolve()
        p = (root / project_id).resolve()
        if not str(p).startswith(str(root)):
            raise ValueError("Sandbox workspace path escapes SANDBOX_ROOT")
        p.mkdir(parents=True, exist_ok=True)
        return p

    @classmethod
    def write_project_files(cls, project_id: str, files: List[Dict[str, str]]) -> Path:
        """Write project code files into the isolated sandbox workspace."""
        workspace = cls.get_workspace_path(project_id)
        for f in files:
            rel_path = f.get("path") or f.get("filename")
            if not rel_path:
                continue
            # Prevent path traversal attacks
            safe_path = Path(rel_path)
            if safe_path.is_absolute() or ".." in safe_path.parts:
                rel_path = safe_path.name

            target_file = workspace / rel_path
            target_file.parent.mkdir(parents=True, exist_ok=True)
            target_file.write_text(f.get("content", ""), encoding="utf-8")
        return workspace

    @staticmethod
    def _sanitize_env() -> Dict[str, str]:
        """Strip dangerous host credentials and keys from child process environment."""
        sanitized = os.environ.copy()
        sensitive_keys = [
            "GROQ_API_KEY",
            "DATABASE_URL",
            "SECRET_KEY",
            "AWS_SECRET_ACCESS_KEY",
            "GITHUB_TOKEN",
            "ANTHROPIC_API_KEY",
            "OPENAI_API_KEY",
        ]
        for key in sensitive_keys:
            sanitized.pop(key, None)
        sanitized["PYTHONPATH"] = "."
        sanitized["PYTHONDONTWRITEBYTECODE"] = "1"
        return sanitized

    @classmethod
    def verify_syntax(cls, project_id: str) -> Dict[str, Any]:
        """Run AST syntax parse checks on all Python files in the sandbox."""
        workspace = cls.get_workspace_path(project_id)
        syntax_errors = []
        valid_files = 0

        for py_file in workspace.rglob("*.py"):
            try:
                content = py_file.read_text(encoding="utf-8")
                ast.parse(content, filename=py_file.name)
                valid_files += 1
            except SyntaxError as e:
                syntax_errors.append({
                    "file": str(py_file.relative_to(workspace)),
                    "line": e.lineno,
                    "offset": e.offset,
                    "text": e.text.strip() if e.text else "",
                    "message": str(e.msg),
                })

        return {
            "all_valid": len(syntax_errors) == 0,
            "checked_files": valid_files + len(syntax_errors),
            "errors": syntax_errors,
        }

    @classmethod
    def execute_test_suite(
        cls,
        project_id: str,
        test_script_content: Optional[str] = None,
        timeout_seconds: int = 15,
    ) -> ExecutionResult:
        """Run pytest in isolated sandbox and extract structured test reports and stack traces."""
        workspace = cls.get_workspace_path(project_id)
        start_time = time.time()

        # If a custom test script is provided, write it to workspace tests directory
        if test_script_content:
            test_dir = workspace / "tests"
            test_dir.mkdir(parents=True, exist_ok=True)
            test_file = test_dir / "test_suite.py"
            test_file.write_text(test_script_content, encoding="utf-8")

        # Use Docker container isolation when SANDBOX_MODE="docker" (network=none, read-only, capped RAM/CPU)
        from app.core.config import settings as app_settings
        effective_timeout = timeout_seconds or app_settings.SANDBOX_TIMEOUT_SECONDS
        use_docker = app_settings.SANDBOX_MODE == "docker"

        if use_docker:
            cmd = [
                "docker", "run", "--rm",
                "--network=none",
                "--read-only",
                "--memory=256m",
                "--cpus=0.5",
                "--tmpfs", "/tmp:rw,size=64m",
                "-v", f"{str(workspace.resolve())}:/workspace:ro",
                "-w", "/workspace",
                "python:3.12-slim",
                "python", "-m", "unittest", "discover", "-s", "tests", "-p", "test*.py",
            ]
        else:
            python_bin = sys.executable
            cmd = [python_bin, "-m", "unittest", "discover", "-s", "tests", "-p", "test*.py"]
            try:
                subprocess.run([python_bin, "-m", "pytest", "--version"], capture_output=True, check=True)
                cmd = [python_bin, "-m", "pytest", "-v", "--tb=short", "tests/"]
            except Exception:
                pass

        try:
            proc = subprocess.run(
                cmd,
                cwd=str(workspace),
                env=cls._sanitize_env(),
                capture_output=True,
                text=True,
                timeout=effective_timeout,
            )
            duration_ms = int((time.time() - start_time) * 1000)

            # Analyze output
            passed = proc.returncode == 0
            stdout = proc.stdout
            stderr = proc.stderr

            diagnostics = {}
            if not passed:
                diagnostics = {
                    "error_summary": "Test assertions failed or runtime exception occurred.",
                    "details": stderr or stdout,
                    "recommended_action": "Route failure payload to Developer Agent for automated patch iteration.",
                }

            return ExecutionResult(
                success=passed,
                exit_code=proc.returncode,
                stdout=stdout,
                stderr=stderr,
                duration_ms=duration_ms,
                test_results={
                    "runner": "pytest" if "pytest" in cmd[2] else "unittest",
                    "passed": passed,
                    "duration_ms": duration_ms,
                },
                diagnostics=diagnostics,
            )

        except subprocess.TimeoutExpired:
            duration_ms = int((time.time() - start_time) * 1000)
            return ExecutionResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=f"Execution timed out after {timeout_seconds}s limit to prevent denial-of-service.",
                duration_ms=duration_ms,
                diagnostics={"error_summary": "Timeout exceeded", "timeout_seconds": timeout_seconds},
            )
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return ExecutionResult(
                success=False,
                exit_code=1,
                stdout="",
                stderr=str(e),
                duration_ms=duration_ms,
                diagnostics={"error_summary": "Execution harness error", "exception": str(e)},
            )

    @classmethod
    def cleanup_workspace(cls, project_id: str) -> bool:
        """Safely destroy isolated workspace directory when no longer needed."""
        workspace = SANDBOX_ROOT / project_id
        if workspace.exists():
            try:
                shutil.rmtree(workspace)
                return True
            except Exception:
                return False
        return True

