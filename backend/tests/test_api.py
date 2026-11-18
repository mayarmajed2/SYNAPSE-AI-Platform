"""SYNAPSE Platform — Fast Unit Tests (Offline / No DB required)."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestAgentExecution(unittest.TestCase):
    """Test all 10 agent generators with fallback logic."""

    def test_supervisor_execution_plan(self):
        from app.agents.supervisor import SupervisorAgent
        plan = SupervisorAgent.create_execution_plan("Test Project", "Build a customer feedback platform")
        self.assertIn("stages", plan)
        self.assertGreaterEqual(len(plan["stages"]), 8)

    def test_product_manager_prd(self):
        from app.agents.product_manager import ProductManagerAgent
        prd = ProductManagerAgent.generate_prd("Test Project", "Build an inventory tool")
        self.assertIn("user_stories", prd)
        self.assertIn("mvp_scope", prd)
        self.assertIn("functional_requirements", prd)

    def test_system_architect_design(self):
        from app.agents.architect import ArchitectAgent
        arch = ArchitectAgent.design_system("Test Project", {"overview": "Sample"})
        self.assertIn("api_endpoints", arch)
        self.assertIn("tech_stack", arch)
        self.assertIn("database_tables", arch)

    def test_backend_developer_code_generation(self):
        from app.agents.backend_developer import BackendDeveloperAgent
        files = BackendDeveloperAgent.generate_backend_code("Test Project", {})
        self.assertGreater(len(files), 0)
        for f in files:
            self.assertIn("path", f)
            self.assertIn("content", f)
            self.assertIn("language", f)

    def test_frontend_developer_code_generation(self):
        from app.agents.frontend_developer import FrontendDeveloperAgent
        files = FrontendDeveloperAgent.generate_frontend_code("Test Project", {})
        self.assertGreater(len(files), 0)
        for f in files:
            self.assertIn("path", f)
            self.assertIn("content", f)

    def test_code_reviewer_analysis(self):
        from app.agents.code_reviewer import CodeReviewerAgent
        review = CodeReviewerAgent.review_codebase("Test Project", [])
        self.assertIn("score", review)
        self.assertGreaterEqual(review["score"], 80)
        self.assertIn("findings", review)

    def test_qa_engineer_test_suite(self):
        from app.agents.qa_engineer import QAEngineerAgent
        qa = QAEngineerAgent.generate_and_execute_tests("Test Project", [])
        self.assertEqual(qa["status"], "passed")
        self.assertGreaterEqual(qa["total_tests"], 3)
        self.assertIn("test_script", qa)

    def test_security_agent_audit(self):
        from app.agents.security_agent import SecurityAgent
        sec = SecurityAgent.audit_security("Test Project", [])
        self.assertIn("risk_level", sec)
        self.assertIn("checks_performed", sec)
        self.assertGreaterEqual(len(sec["checks_performed"]), 4)

    def test_documentation_agent_output(self):
        from app.agents.documentation import DocumentationAgent
        docs = DocumentationAgent.generate_documentation("Test Project", {}, {})
        self.assertGreater(len(docs), 0)
        self.assertIn("README.md", docs[0]["filename"])

    def test_deployment_agent_manifests(self):
        from app.agents.deployment import DeploymentAgent
        manifests = DeploymentAgent.generate_deployment_manifests("Test Project", {})
        self.assertGreaterEqual(len(manifests), 3)
        filenames = [m["filename"] for m in manifests]
        self.assertIn("Dockerfile", filenames)
        self.assertIn("docker-compose.yml", filenames)


class TestServices(unittest.TestCase):
    """Test Sandbox, Git, and Architecture services."""

    def test_sandbox_syntax_verification(self):
        from app.services.sandbox import CodeSandbox
        project_id = "test_syntax_proj"
        files = [{"path": "module.py", "content": "x = 42\ndef hello():\n    return 'world'\n"}]
        CodeSandbox.write_project_files(project_id, files)
        result = CodeSandbox.verify_syntax(project_id)
        self.assertTrue(result["all_valid"])
        self.assertEqual(len(result["errors"]), 0)
        CodeSandbox.cleanup_workspace(project_id)

    def test_git_service_commit_and_pr(self):
        from app.services.git_service import GitService
        project_id = "test_git_proj"
        GitService.init_repository(project_id, "Git Test App")
        commit = GitService.commit_artifacts(
            project_id=project_id,
            agent_name="David Thorne",
            agent_role="backend_developer",
            message="feat(api): initial endpoints",
            files=[{"path": "app.py", "content": "print('hello')"}]
        )
        self.assertIn("id", commit)
        pr = GitService.create_pull_request(
            project_id=project_id,
            title="Add initial API",
            description="PR description",
            source_branch="feature/backend-api"
        )
        self.assertEqual(pr["status"], "open")
        merged = GitService.merge_pull_request(project_id, pr["id"])
        self.assertEqual(merged["status"], "merged")

    def test_architecture_service_analysis(self):
        from app.services.architecture_service import ArchitectureService
        res = ArchitectureService.analyze_architecture("Test Project", {})
        self.assertIn("components", res)
        self.assertIn("connections", res)
        self.assertIn("adrs", res)
        self.assertGreaterEqual(len(res["adrs"]), 4)


class TestEnumsAndModels(unittest.TestCase):
    """Test domain enums."""

    def test_project_statuses(self):
        from app.db.enums import ProjectStatus
        values = [e.value for e in ProjectStatus]
        self.assertIn("planning", values)
        self.assertIn("in_progress", values)
        self.assertIn("completed", values)

    def test_agent_roles_count_is_10(self):
        from app.db.enums import AgentRole
        roles = [e.value for e in AgentRole]
        self.assertEqual(len(roles), 10)
        self.assertIn("supervisor", roles)
        self.assertIn("deployment_agent", roles)

    def test_workflow_statuses(self):
        from app.db.enums import WorkflowStatus
        statuses = [e.value for e in WorkflowStatus]
        self.assertIn("running", statuses)
        self.assertIn("waiting_approval", statuses)
        self.assertIn("completed", statuses)


if __name__ == "__main__":
    unittest.main(verbosity=2)
