/**
 * Static Demo Showcase Data for GitHub Pages / offline preview mode.
 * Used automatically when hosted on github.io or when no local backend is reachable.
 */

const DEMO_PROJECT_ID = "demo-taskflow-ai-001";
const DEMO_WORKFLOW_ID = "demo-workflow-001";
const NOW = new Date().toISOString();

const DEMO_AGENTS = [
  { id: "ag-1", name: "Alex Vance", role: "supervisor", description: "Chief AI Orchestrator. Decomposes project vision into DAG task graphs, manages dependencies, retries, and approval gates.", status: "idle", success_rate: 99.4, completed_tasks: 14, total_tasks: 14, avg_execution_time_ms: 450 },
  { id: "ag-2", name: "Sarah Chen", role: "product_manager", description: "Product Lead. Transforms raw ideas into structured PRDs, user stories, and Given/When/Then acceptance criteria.", status: "idle", success_rate: 98.8, completed_tasks: 12, total_tasks: 12, avg_execution_time_ms: 780 },
  { id: "ag-3", name: "Marcus Aurelius", role: "system_architect", description: "Principal Technical Architect. Designs full-stack topologies, relational schemas, and REST API contracts.", status: "idle", success_rate: 99.1, completed_tasks: 11, total_tasks: 11, avg_execution_time_ms: 920 },
  { id: "ag-4", name: "David Thorne", role: "backend_developer", description: "Principal Backend Engineer. Implements FastAPI endpoints, Pydantic schemas, and SQLAlchemy ORM models.", status: "idle", success_rate: 98.2, completed_tasks: 16, total_tasks: 16, avg_execution_time_ms: 1150 },
  { id: "ag-5", name: "Elena Rostova", role: "frontend_developer", description: "Senior Frontend Engineer. Crafts modular React 19 + TypeScript components and enterprise SaaS dashboards.", status: "idle", success_rate: 97.6, completed_tasks: 15, total_tasks: 15, avg_execution_time_ms: 1320 },
  { id: "ag-6", name: "Claire Dupont", role: "code_reviewer", description: "Senior Staff Code Reviewer. Performs peer reviews across generated code and flags anti-patterns.", status: "idle", success_rate: 99.5, completed_tasks: 13, total_tasks: 13, avg_execution_time_ms: 610 },
  { id: "ag-7", name: "Tariq Mansour", role: "qa_engineer", description: "Lead QA Engineer. Generates and executes automated pytest suites and regression diagnostics.", status: "idle", success_rate: 96.9, completed_tasks: 12, total_tasks: 12, avg_execution_time_ms: 890 },
  { id: "ag-8", name: "Aiden Cross", role: "security_agent", description: "Cybersecurity Specialist. Runs SAST audits for OWASP Top 10 vulnerabilities and secrets exposure.", status: "idle", success_rate: 99.7, completed_tasks: 11, total_tasks: 11, avg_execution_time_ms: 540 },
  { id: "ag-9", name: "Maya Patel", role: "documentation_agent", description: "Technical Documentation Specialist. Authors READMEs, OpenAPI references, and architecture runbooks.", status: "idle", success_rate: 99.9, completed_tasks: 10, total_tasks: 10, avg_execution_time_ms: 480 },
  { id: "ag-10", name: "Devon Brooks", role: "deployment_agent", description: "Lead DevOps Specialist. Engineers production Dockerfiles, Compose topologies, and Kubernetes manifests.", status: "idle", success_rate: 99.2, completed_tasks: 9, total_tasks: 9, avg_execution_time_ms: 670 },
];

const DEMO_PROJECTS = [
  {
    id: DEMO_PROJECT_ID,
    name: "TaskFlow AI",
    slug: "taskflow-ai",
    description: "Enterprise Kanban and sprint tracking SaaS with real-time team collaboration and AI backlog prioritization.",
    idea: "An enterprise Kanban and sprint tracking SaaS with real-time team collaboration, role-based access control, and AI-powered backlog prioritization.",
    project_type: "Full-Stack Web App",
    complexity: "Medium",
    tech_stack: { frontend: "React 19 + TypeScript", backend: "FastAPI + SQLAlchemy", database: "PostgreSQL 16" },
    status: "completed",
    execution_progress: 100,
    created_at: NOW,
    updated_at: NOW,
  },
];

const DEMO_WORKFLOW = {
  id: DEMO_WORKFLOW_ID,
  project_id: DEMO_PROJECT_ID,
  name: "TaskFlow AI — Autonomous SDLC Pipeline",
  status: "completed",
  current_step: "Delivered",
  total_steps: 9,
  nodes: [
    { id: "n1", node_key: "supervisor", agent_role: "supervisor", title: "Supervisor Orchestrator", status: "completed", position_x: 60, position_y: 180, duration_ms: 450 },
    { id: "n2", node_key: "product_manager", agent_role: "product_manager", title: "Product Manager (PRD)", status: "completed", position_x: 320, position_y: 120, duration_ms: 780 },
    { id: "n3", node_key: "system_architect", agent_role: "system_architect", title: "System Architect", status: "completed", position_x: 580, position_y: 120, duration_ms: 920 },
    { id: "n4", node_key: "backend_developer", agent_role: "backend_developer", title: "Backend Developer", status: "completed", position_x: 840, position_y: 60, duration_ms: 1150 },
    { id: "n5", node_key: "frontend_developer", agent_role: "frontend_developer", title: "Frontend Developer", status: "completed", position_x: 840, position_y: 220, duration_ms: 1320 },
    { id: "n6", node_key: "code_reviewer", agent_role: "code_reviewer", title: "Code Reviewer", status: "completed", position_x: 1100, position_y: 140, duration_ms: 610 },
    { id: "n7", node_key: "qa_engineer", agent_role: "qa_engineer", title: "QA Engineer", status: "completed", position_x: 1360, position_y: 80, duration_ms: 890 },
    { id: "n8", node_key: "security_agent", agent_role: "security_agent", title: "Security SAST Audit", status: "completed", position_x: 1360, position_y: 220, duration_ms: 540 },
    { id: "n9", node_key: "documentation_agent", agent_role: "documentation_agent", title: "Delivery Documentation", status: "completed", position_x: 1620, position_y: 140, duration_ms: 480 },
  ],
  edges: [
    { id: "e1", source_node_id: "supervisor", target_node_id: "product_manager", animated: false },
    { id: "e2", source_node_id: "product_manager", target_node_id: "system_architect", animated: false },
    { id: "e3", source_node_id: "system_architect", target_node_id: "backend_developer", animated: false },
    { id: "e4", source_node_id: "system_architect", target_node_id: "frontend_developer", animated: false },
    { id: "e5", source_node_id: "backend_developer", target_node_id: "code_reviewer", animated: false },
    { id: "e6", source_node_id: "frontend_developer", target_node_id: "code_reviewer", animated: false },
    { id: "e7", source_node_id: "code_reviewer", target_node_id: "qa_engineer", animated: false },
    { id: "e8", source_node_id: "code_reviewer", target_node_id: "security_agent", animated: false },
    { id: "e9", source_node_id: "qa_engineer", target_node_id: "documentation_agent", animated: false },
    { id: "e10", source_node_id: "security_agent", target_node_id: "documentation_agent", animated: false },
  ],
};

const DEMO_ARTIFACTS = [
  { id: "art-1", project_id: DEMO_PROJECT_ID, file_path: "docs/PRD.md", file_name: "PRD.md", artifact_type: "documentation", language: "markdown", size_bytes: 2480, version: 1, content: "# TaskFlow AI — Product Requirements Document\n\n## Vision\nEnterprise Kanban & sprint tracking SaaS with AI backlog prioritization and real-time collaboration.\n\n## Core User Stories\n- As a Product Manager, I can prioritize sprint backlogs using AI scoring.\n- As an Engineer, I can move cards across Kanban columns with live WebSocket sync.\n- As an Admin, I can enforce RBAC permissions per workspace.", created_at: NOW },
  { id: "art-2", project_id: DEMO_PROJECT_ID, file_path: "backend/app/main.py", file_name: "main.py", artifact_type: "code", language: "python", size_bytes: 1420, version: 1, content: "from fastapi import FastAPI\n\napp = FastAPI(title='TaskFlow AI API', version='1.0.0')\n\n@app.get('/health')\ndef health():\n    return {'status': 'healthy', 'service': 'TaskFlow AI'}\n", created_at: NOW },
  { id: "art-3", project_id: DEMO_PROJECT_ID, file_path: "frontend/src/App.tsx", file_name: "App.tsx", artifact_type: "code", language: "typescript", size_bytes: 1850, version: 1, content: "export function App() {\n  return (\n    <main className='p-6'>\n      <h1>TaskFlow AI — Kanban & Sprint Workspace</h1>\n    </main>\n  );\n}\n", created_at: NOW },
  { id: "art-4", project_id: DEMO_PROJECT_ID, file_path: "README.md", file_name: "README.md", artifact_type: "documentation", language: "markdown", size_bytes: 1690, version: 1, content: "# TaskFlow AI\n\nGenerated autonomously by SYNAPSE AI Engineering Platform.\n\n## Quick Start\n```bash\ndocker compose up -d\n```\n", created_at: NOW },
];

const DEMO_TEST_RUNS = [
  {
    id: "tr-1",
    project_id: DEMO_PROJECT_ID,
    total_tests: 8,
    passed_tests: 8,
    failed_tests: 0,
    skipped_tests: 0,
    duration_ms: 890,
    status: "passed",
    created_at: NOW,
    results: [
      { id: "res-1", test_name: "test_health_endpoint", test_file: "tests/test_api.py", status: "passed", duration_ms: 42 },
      { id: "res-2", test_name: "test_create_kanban_board", test_file: "tests/test_boards.py", status: "passed", duration_ms: 118 },
      { id: "res-3", test_name: "test_rbac_authorization", test_file: "tests/test_auth.py", status: "passed", duration_ms: 95 },
      { id: "res-4", test_name: "test_ai_backlog_ranking", test_file: "tests/test_ai.py", status: "passed", duration_ms: 210 },
    ],
  },
];

const DEMO_SECURITY_SCANS = [
  {
    id: "sec-1",
    project_id: DEMO_PROJECT_ID,
    status: "completed",
    total_vulnerabilities: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    low_count: 0,
    summary: "OWASP Top 10 & SAST audit completed with 0 critical or high findings.",
    created_at: NOW,
    findings: [],
  },
];

const DEMO_ANALYTICS = {
  total_projects: 1,
  active_projects: 0,
  completed_projects: 1,
  total_agent_executions: 9,
  success_rate: 100.0,
  average_execution_time_seconds: 0.12,
  total_tokens_consumed: 3495,
  estimated_ai_cost_usd: 0.0025,
};

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    import.meta.env.VITE_DEMO_MODE === "true" ||
    window.location.hostname.endsWith("github.io")
  );
}

export function getDemoResponse(endpoint: string, method = "GET"): any {
  const path = endpoint.split("?")[0];

  if (path === "/health") {
    return {
      status: "healthy",
      service: "SYNAPSE Demo Showcase",
      version: "1.0.0",
      database: { status: "connected", type: "Static Showcase Mode" },
      agents: { registered: DEMO_AGENTS.length, status: "ready" },
    };
  }
  if (path === "/agents") return DEMO_AGENTS;
  if (path.startsWith("/agents/") && path.endsWith("/tasks")) return [];
  if (path.startsWith("/agents/")) return DEMO_AGENTS[0];

  if (path === "/projects" && method === "POST") {
    return DEMO_PROJECTS[0];
  }
  if (path === "/projects") return DEMO_PROJECTS;
  if (path.endsWith("/details")) {
    return {
      ...DEMO_PROJECTS[0],
      workflow: DEMO_WORKFLOW,
      artifacts: DEMO_ARTIFACTS,
      test_runs: DEMO_TEST_RUNS,
      security_scans: DEMO_SECURITY_SCANS,
    };
  }
  if (path.startsWith("/projects/")) return DEMO_PROJECTS[0];

  if (path.startsWith("/workflows/")) return DEMO_WORKFLOW;
  if (path === "/tasks") {
    return DEMO_WORKFLOW.nodes.map((n, idx) => ({
      id: `task-${idx + 1}`,
      project_id: DEMO_PROJECT_ID,
      title: n.title,
      description: `Autonomous execution stage for ${n.title}`,
      status: "completed",
      priority: "high",
      created_at: NOW,
    }));
  }
  if (path.includes("/artifacts/") && path.endsWith("/tree")) {
    return [
      { name: "docs", type: "folder", children: [{ name: "PRD.md", type: "file", id: "art-1", path: "docs/PRD.md" }] },
      { name: "backend", type: "folder", children: [{ name: "main.py", type: "file", id: "art-2", path: "backend/app/main.py" }] },
      { name: "frontend", type: "folder", children: [{ name: "App.tsx", type: "file", id: "art-3", path: "frontend/src/App.tsx" }] },
      { name: "README.md", type: "file", id: "art-4", path: "README.md" },
    ];
  }
  if (path.startsWith("/artifacts/project/")) return DEMO_ARTIFACTS;
  if (path.startsWith("/artifacts/")) return DEMO_ARTIFACTS[0];

  if (path.startsWith("/testing/")) return DEMO_TEST_RUNS;
  if (path.startsWith("/security/")) return DEMO_SECURITY_SCANS;
  if (path.startsWith("/approvals")) return [];
  if (path === "/analytics/overview") return DEMO_ANALYTICS;
  if (path === "/analytics/agents") {
    return DEMO_AGENTS.map((a) => ({ ...a, agent_id: a.id, avatar_url: null }));
  }
  if (path === "/analytics/usage") {
    return [
      { model: "llama-3.3-70b-versatile", provider: "groq", prompt_tokens: 1620, completion_tokens: 890, total_tokens: 2510, cost_usd: 0.0021, call_count: 6 },
      { model: "llama-3.1-8b-instant", provider: "groq", prompt_tokens: 650, completion_tokens: 335, total_tokens: 985, cost_usd: 0.0004, call_count: 3 },
    ];
  }
  if (path.startsWith("/audit/logs")) {
    return [
      { id: "log-1", event_type: "workflow.completed", actor: "Alex Vance (Supervisor)", details: { project: "TaskFlow AI", artifacts: 12 }, created_at: NOW },
      { id: "log-2", event_type: "security.audit_passed", actor: "Aiden Cross (Security Agent)", details: { critical: 0, high: 0 }, created_at: NOW },
    ];
  }
  if (path.includes("/git/") && path.endsWith("/commits")) {
    return [
      { sha: "a91f3c2", message: "feat: scaffold FastAPI & React 19 application", author: "David Thorne", date: NOW },
      { sha: "b48e21d", message: "docs: add OpenAPI specs and delivery runbook", author: "Maya Patel", date: NOW },
    ];
  }
  if (path.includes("/git/") && path.endsWith("/pull-requests")) return [];
  if (path.startsWith("/git/")) return { branch: "main", status: "clean", commits_count: 2 };
  if (path.startsWith("/architecture/")) {
    return {
      project_id: DEMO_PROJECT_ID,
      summary: "3-Tier Event-Driven Full-Stack SaaS Architecture",
      services: ["Vite + React 19 SPA", "FastAPI REST & WebSocket Engine", "PostgreSQL 16 Relational Store"],
      health_score: 96,
    };
  }
  if (path.startsWith("/auth/")) {
    const demoUser = {
      id: "demo-user-01",
      email: "demo@synapse.ai",
      full_name: "Principal Engineer",
      role: "admin",
      is_active: true,
      workspace: { id: "demo-ws-01", name: "SYNAPSE HQ", slug: "default-workspace", plan: "pro" },
    };
    if (path === "/auth/me") return demoUser;
    return { access_token: "demo-jwt-token", token_type: "bearer", user: demoUser };
  }
  if (path.startsWith("/settings")) {
    return {
      workspace_name: "SYNAPSE HQ",
      primary_model: "llama-3.3-70b-versatile",
      fast_model: "llama-3.1-8b-instant",
      max_retries: 3,
      sandbox_timeout_seconds: 30,
      require_approval_gates: true,
      auto_run_security_scan: true,
      plan: "pro",
      groq_configured: true,
    };
  }
  if (path.startsWith("/billing/")) {
    return {
      plan: "pro",
      plan_name: "Pro",
      projects_used: 1,
      projects_limit: null,
      quota_exceeded: false,
      stripe_configured: false,
      mode: "self_hosted",
      message: "Demo workspace active on PRO plan.",
    };
  }
  if (path.startsWith("/reports/")) {
    return {
      project_name: "TaskFlow AI",
      sections: {
        "1_executive_summary": {
          title: "1. Executive Summary",
          content: "TaskFlow AI was engineered across all 10 autonomous stages with 100% QA pass rate and 0 critical findings.",
          status: "APPROVED_FOR_RELEASE",
          progress: "100%",
        },
        "6_file_structure": { total_files: 6, files: ["backend/app/main.py", "frontend/src/App.tsx", "tests/test_generated.py", "deploy/Dockerfile"] },
        "10_testing_results": { total_tests: 8, passed_tests: 8, failed_tests: 0, pass_rate: "100%" },
        "12_security_findings": { critical: 0, high: 0, medium: 0, low: 0, status: "PASSED_LOW_RISK" },
        "17_cost_summary": { total_tokens_consumed: 3495, estimated_cost_usd: 0.0025 },
      },
      generated_at: NOW,
    };
  }

  return {};
}
