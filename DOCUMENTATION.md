# SYNAPSE — Autonomous AI Software Engineering Platform Documentation

> **Version:** 1.0.0  
> **Live Demo (GitHub Pages):** [https://mayarmajed2.github.io/SYNAPSE-AI-Platform/](https://mayarmajed2.github.io/SYNAPSE-AI-Platform/)  
> **Repository:** [mayarmajed2/SYNAPSE-AI-Platform](https://github.com/mayarmajed2/SYNAPSE-AI-Platform)  
> **Stack:** FastAPI · SQLAlchemy 2.0 · PostgreSQL 16 (with automatic SQLite fallback) · Groq LLM (Llama 3.3 / 3.1) · WebSockets · React 19 · TypeScript · Vite 8

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [System Architecture](#2-system-architecture)
3. [The Autonomous AI Workforce (10 Specialized Agents)](#3-the-autonomous-ai-workforce-10-specialized-agents)
4. [Platform Walkthrough & Live Screenshots](#4-platform-walkthrough--live-screenshots)
5. [Frontend Pages & Capabilities](#5-frontend-pages--capabilities)
6. [Backend Architecture & Database Schema (18 Models)](#6-backend-architecture--database-schema-18-models)
7. [REST API & WebSocket Reference](#7-rest-api--websocket-reference)
8. [Installation, Configuration & Running Locally](#8-installation-configuration--running-locally)
9. [Docker Deployment](#9-docker-deployment)
10. [Testing & Verification](#10-testing--verification)

---

## 1. Executive Overview

**SYNAPSE** is an autonomous AI software engineering platform modeled as a virtual software engineering company. Instead of relying on a single monolithic prompt, SYNAPSE decomposes software delivery across a coordinated fleet of specialized AI agents—covering requirements engineering, system architecture, backend and frontend implementation, code review, automated QA testing, SAST/OWASP security auditing, technical documentation, and deployment readiness.

Users submit a product idea through an enterprise SaaS dashboard, configure complexity and optional human approval gates, and observe the full multi-agent pipeline execute in real time over WebSockets—producing inspectable source code artifacts, test reports, security scan findings, architecture intelligence, and downloadable project archives.

### Key Highlights
- **End-to-End Autonomous SDLC**: Transforms a plain-English product vision into structured PRDs, architecture blueprints, backend/frontend code, test suites, security audits, and delivery documentation.
- **Interactive Workflow Studio**: Visual directed graph of multi-agent execution nodes, dependencies, statuses, execution durations, and artifact drill-downs.
- **Human-in-the-Loop Governance**: Built-in Approvals Center, Audit Logs, Security Center, and Engineering Delivery Reports.
- **Real-Time Observability**: Live WebSocket sync (`Live Sync`), LLM token consumption tracking, estimated cost analytics, latency metrics, and ROI simulation.
- **Zero-Friction Persistence**: Designed for PostgreSQL 16 (with `JSONB`) and automatically falls back to local SQLite (`backend/synapse.db`) when PostgreSQL is offline.

---

## 2. System Architecture

```mermaid
flowchart TB
    User["User / Principal Engineer"]
    FE["Frontend: React 19 + TypeScript + Vite 8\n(Enterprise SaaS Dashboard — :5173)"]
    API["Backend: FastAPI + Uvicorn\n(REST API + WebSocket Engine — :8000 / :8001)"]
    ORCH["Multi-Agent Orchestration Engine\n(DAG Workflow + 10 Specialized Agents)"]
    DB["PostgreSQL 16 / SQLite Fallback\n(18 SQLAlchemy ORM Models)"]
    LLM["Groq LLM Provider\n(Llama 3.3 70B / Llama 3.1 8B)"]
    WS["WebSocket Hub\n(/ws/global & /ws/projects/{id})"]

    User --> FE
    FE <-->|"HTTP / REST (/api/v1)"| API
    FE <-->|"Real-Time Events (WS)"| WS
    API --> ORCH
    API --> DB
    ORCH --> DB
    ORCH --> LLM
    ORCH --> WS
```

### Repository Structure

```text
SYNAPSE-CLONE/
├── backend/
│   ├── alembic/                # Database migration scripts (001_initial_schema.py)
│   ├── app/
│   │   ├── agents/             # 10 specialized agent implementations
│   │   ├── api/v1/             # 14 FastAPI routers (REST + WebSockets)
│   │   ├── core/               # Configuration & shared utilities
│   │   ├── db/                 # SQLAlchemy models (18 tables), enums, seed script
│   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   ├── services/           # Business logic, LLM client, artifact & scan services
│   │   ├── workflows/          # DAG workflow engine & execution orchestrator
│   │   ├── database.py         # PostgreSQL engine with graceful SQLite fallback
│   │   └── main.py             # FastAPI app, CORS, lifespan auto-init & seeding
│   ├── tests/                  # Automated API test suite
│   ├── .env.example            # Environment variable template
│   ├── Dockerfile              # Container build specification
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout shell, sidebar, header, reusable UI components
│   │   ├── hooks/              # Real-time WebSocket hook (useWebSocket.ts)
│   │   ├── pages/              # 17 enterprise dashboard views
│   │   ├── services/           # Typed REST API client (api.ts)
│   │   └── App.tsx             # React Router v7 route definitions
│   ├── package.json            # React 19, Lucide icons, Vite 8, TypeScript
│   └── vite.config.ts          # Dev server & API proxy configuration
├── screenshots/                # Live application verification screenshots
├── docker-compose.yml          # PostgreSQL 16 + FastAPI backend stack
├── start-all.bat               # Windows convenience launcher
├── DOCUMENTATION.md            # This technical documentation
└── LINKEDIN_POST.md            # Launch announcement post copy
```

---

## 3. The Autonomous AI Workforce (10 Specialized Agents)

On startup, `backend/app/db/seed.py` automatically seeds the default user (`architect@synapse.ai`), workspace (`SYNAPSE HQ`), and **10 specialized AI agents** (the 9 core SDLC pipeline agents plus the DevOps Deployment Agent):

| # | Agent Name | Role Key | Title | Primary Responsibilities |
|---|---|---|---|---|
| 1 | **Alex Vance** | `supervisor` | Chief AI Orchestrator | Decomposes project vision into DAG task graphs, coordinates dependencies, manages retries, and enforces quality gates |
| 2 | **Sarah Chen** | `product_manager` | Product Lead | Produces Product Requirements Documents (PRD), user personas, user stories, and Given/When/Then acceptance criteria |
| 3 | **Marcus Aurelius** | `system_architect` | Principal Technical Architect | Designs full-stack topologies, relational schemas, REST API contracts, and technology stack blueprints |
| 4 | **David Thorne** | `backend_developer` | Principal Backend Engineer | Generates FastAPI routers, Pydantic schemas, SQLAlchemy ORM models, authentication, and business logic |
| 5 | **Elena Rostova** | `frontend_developer` | Senior Frontend Engineer | Crafts modular React & TypeScript components, responsive SaaS layouts, client state, and API integrations |
| 6 | **Claire Dupont** | `code_reviewer` | Senior Staff Code Reviewer | Conducts peer reviews across generated code, flags anti-patterns, and verifies architectural consistency |
| 7 | **Tariq Mansour** | `qa_engineer` | Lead QA Engineer | Designs and executes automated test suites (unit, integration, regression) and diagnoses failures |
| 8 | **Aiden Cross** | `security_agent` | Cybersecurity Specialist | Runs SAST audits for OWASP Top 10 vulnerabilities, hardcoded secrets, injection risks, and CWE mapping |
| 9 | **Maya Patel** | `documentation_agent` | Technical Documentation Specialist | Authors READMEs, OpenAPI guides, architecture runbooks, setup instructions, and changelogs |
| 10 | **Devon Brooks** | `deployment_agent` | Lead DevOps & Cloud Specialist | Generates Dockerfiles, Docker Compose topologies, Kubernetes manifests, and staging deployment readiness checks |

---

## 4. Platform Walkthrough & Live Screenshots

All screenshots below were captured at `1440×900` against a live local deployment of SYNAPSE executing a real end-to-end project (**TaskFlow AI**).

### Overview Dashboard (`/`)
Displays live platform health (`Live Sync`), the 9-stage autonomous software lifecycle, KPI cards (total projects, agent tasks, average execution time, AI tokens & cost), recent pipelines, and active workforce fleet.

![Overview Dashboard](./screenshots/01-overview-dashboard.png)

### Autonomous Agent Workforce (`/workforce`)
Lists all 10 registered AI specialists with their role badges, operational status, task completion metrics, success rates, and system prompts.

![Autonomous Agent Workforce](./screenshots/02-agent-workforce.png)

### Launch Autonomous Project (`/projects/new`)
Guided project intake form supporting custom product visions, quick-start templates, project archetypes, system complexity levels, and optional human-in-the-loop approval gates.

![New Project Creation](./screenshots/03-new-project.png)

### Software Projects Directory (`/projects`)
Searchable, filterable portfolio of all autonomous engineering projects with completion progress, stack badges, and quick navigation.

![Software Projects List](./screenshots/04-projects-list.png)

### Interactive Workflow Studio (`/workflow-studio`)
Visual multi-agent DAG execution canvas displaying real-time node progression, per-stage execution durations, inspector details, and direct links to generated code and QA assertions.

![Workflow Studio](./screenshots/05-workflow-studio.png)

### Project Details & Generated Artifacts (`/projects/:id`)
Consolidated project view highlighting autonomous execution progress, lifecycle stage (`Delivered`), generated code artifacts, and artifact download capabilities.

![Project Details](./screenshots/06-project-details.png)

### AI Observability & Business Analytics (`/analytics`)
Tracks token consumption (prompt vs. completion split), estimated LLM cost, execution latency, success rate, autonomous quality gates, and an interactive ROI simulator.

![Analytics & Observability](./screenshots/07-analytics-observability.png)

### Interactive OpenAPI / Swagger Documentation (`/docs`)
Auto-generated OpenAPI 3.1 specification exposing every SYNAPSE REST endpoint for testing and external integration.

![FastAPI Swagger UI](./screenshots/08-api-swagger-docs.png)

---

## 5. Frontend Pages & Capabilities

The React 19 SPA (`frontend/src/App.tsx`) provides **17 dedicated enterprise views** organized into four navigation groups:

| Group | Route | Page Component | Purpose |
|---|---|---|---|
| **Core** | `/` | `OverviewPage` | Executive HQ dashboard, KPIs, 9-stage lifecycle, live project feed |
| | `/projects/new` | `NewProjectPage` | Autonomous project intake & workflow initialization |
| | `/projects` | `ProjectsPage` | Searchable and status-filterable project catalog |
| | `/projects/:id` | `ProjectDetailsPage` | Deep dive into a single project's workflow, artifacts, QA, and security |
| | `/workforce` | `WorkforcePage` | Directory and telemetry for all 10 specialized AI agents |
| **Engineering** | `/workflow-studio` | `WorkflowStudioPage` | Interactive multi-agent DAG graph engine with run/pause/resume/cancel |
| | `/tasks` | `TaskCenterPage` | Granular task queue, status tracking, and retry controls |
| | `/workspace` | `CodeWorkspacePage` | File tree explorer, syntax-highlighted artifact viewer, and `.zip` export |
| | `/testing` | `TestingQAPage` | Automated test runs, assertion counts, and failure trace diagnostics |
| | `/security` | `SecurityCenterPage` | SAST & OWASP vulnerability dashboard with severity breakdown and CWE fixes |
| **Governance & Ops** | `/architecture` | `ArchitectureIntelligencePage` | System blueprint, component topology, and stack intelligence |
| | `/approvals` | `ApprovalsCenterPage` | Human-in-the-loop approval queue with approve/reject & audit notes |
| | `/git-releases` | `GitReleasesPage` | Simulated repository status, commit history, and pull request workflow |
| | `/reports` | `EngineeringReportsPage` | Executive delivery reports with Markdown export |
| **Observability** | `/analytics` | `AnalyticsPage` | Token usage, LLM cost tracking, quality gate scores, and ROI calculator |
| | `/audit-logs` | `AuditLogsPage` | Immutable chronological activity log of system and human actions |
| | `/settings` | `SettingsPage` | Platform configuration, model selection, and workspace preferences |

---

## 6. Backend Architecture & Database Schema (18 Models)

Defined in `backend/app/db/models.py`, SYNAPSE uses SQLAlchemy 2.0 ORM with cross-platform `JSON`/`JSONB` column mapping (`JSON().with_variant(JSONB, "postgresql")`), allowing seamless operation on both **PostgreSQL 16** and **SQLite**.

### Data Models

| Domain | Models | Key Purpose |
|---|---|---|
| **Identity & Multi-Tenancy** | `User`, `Workspace` | Workspace ownership and role-based administration |
| **Project & Agent Fleet** | `Project`, `Agent` | Project metadata, tech stack, progress, and agent fleet metrics |
| **Workflow & Execution** | `Workflow`, `WorkflowNode`, `WorkflowEdge`, `Execution`, `Task`, `AgentMessage` | Directed acyclic graph (DAG) topology, stage timing, task dependencies, retries, and inter-agent messages |
| **Deliverables** | `Artifact` | Versioned source code and documentation files with checksums and language metadata |
| **Quality & Security** | `TestRun`, `TestResult`, `SecurityScan`, `SecurityFinding` | Automated QA runs, assertion diagnostics, SAST scans, severity counts, and CWE remediation |
| **Governance & Observability** | `ApprovalRequest`, `AuditLog`, `LLMUsageRecord` | Human gate decisions, immutable audit trail, and token/latency/cost accounting |

---

## 7. REST API & WebSocket Reference

Base URL: `/api/v1` (Interactive OpenAPI docs available at `/docs`).

### Core Endpoints

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` or `/api/v1/health` | Service status, database connectivity, and registered agent count |
| **Projects** | `GET` | `/api/v1/projects` | List projects with optional `search` and `status` filters |
| | `POST` | `/api/v1/projects` | Create project and auto-generate multi-agent workflow DAG |
| | `GET` | `/api/v1/projects/{id}` | Retrieve project summary |
| | `GET` | `/api/v1/projects/{id}/details` | Retrieve full project details (workflow, artifacts, tests, security) |
| | `PUT` / `DELETE` | `/api/v1/projects/{id}` | Update or delete a project |
| **Agents** | `GET` | `/api/v1/agents` | List all specialized AI agents |
| | `GET` | `/api/v1/agents/{id}` | Get agent profile and metrics |
| | `GET` | `/api/v1/agents/{id}/tasks` | List tasks assigned to a specific agent |
| **Workflows** | `GET` | `/api/v1/workflows/project/{project_id}` | Fetch project workflow graph (nodes & edges) |
| | `POST` | `/api/v1/workflows/{id}/start` | Start autonomous multi-agent execution |
| | `POST` | `/api/v1/workflows/{id}/pause` | Pause an active workflow |
| | `POST` | `/api/v1/workflows/{id}/resume` | Resume a paused workflow |
| | `POST` | `/api/v1/workflows/{id}/cancel` | Cancel an active workflow |
| **Tasks** | `GET` | `/api/v1/tasks` | Filter tasks by `project_id`, `status`, or `agent_id` |
| | `POST` | `/api/v1/tasks/{id}/retry` | Retry a failed task |
| **Artifacts** | `GET` | `/api/v1/artifacts/project/{project_id}` | List generated code and documentation artifacts |
| | `GET` | `/api/v1/artifacts/project/{project_id}/tree` | Retrieve nested directory tree |
| | `GET` | `/api/v1/artifacts/project/{project_id}/download` | Download full project codebase as a `.zip` archive |
| **Testing & QA** | `GET` | `/api/v1/testing/project/{project_id}` | Retrieve QA test runs and individual results |
| | `POST` | `/api/v1/testing/project/{project_id}/execute` | Trigger automated test suite execution |
| **Security** | `GET` | `/api/v1/security/project/{project_id}` | Retrieve SAST security scans and findings |
| | `POST` | `/api/v1/security/project/{project_id}/execute` | Trigger a new security vulnerability scan |
| **Approvals** | `GET` | `/api/v1/approvals` | List human-in-the-loop approval requests |
| | `POST` | `/api/v1/approvals/{id}/resolve` | Approve or reject a gated action with comments |
| **Git & Releases** | `GET` | `/api/v1/git/project/{project_id}` | Repository status, commits (`/commits`), and pull requests (`/pull-requests`) |
| | `POST` | `/api/v1/git/project/{project_id}/pull-requests` | Create or merge (`/{pr_id}/merge`) pull requests |
| **Architecture & Reports** | `GET` | `/api/v1/architecture/project/{project_id}` | System architecture intelligence and component topology |
| | `GET` | `/api/v1/reports/project/{project_id}` | Engineering delivery report (JSON or `/markdown` download) |
| **Analytics & Audit** | `GET` | `/api/v1/analytics/overview` | Platform-wide KPIs, token totals, and estimated cost |
| | `GET` | `/api/v1/analytics/agents` | Per-agent workload and success metrics |
| | `GET` | `/api/v1/analytics/usage` | Detailed LLM token usage records |
| | `GET` | `/api/v1/audit/logs` | Chronological audit log stream |
| **WebSockets** | `WS` | `/ws/global` | Global real-time platform event stream |
| | `WS` | `/ws/projects/{project_id}` | Project-scoped real-time workflow & agent telemetry |

---

## 8. Installation, Configuration & Running Locally

### Prerequisites
- **Python 3.11+** (verified on Python 3.14)
- **Node.js 20+** and **npm** (verified on Node.js v26.13.1 LTS)
- **PostgreSQL 16** (optional — SYNAPSE automatically falls back to local SQLite if PostgreSQL is not running)
- **Groq API Key** (optional for live LLM generation; configure in `backend/.env`)

### Step 1: Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and customize as needed:

```env
PROJECT_NAME=SYNAPSE
API_V1_STR=/api/v1
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg://synapse:synapse_dev_2026@localhost:5433/synapse_db
GROQ_API_KEY=your_groq_api_key_here
GROQ_PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_FAST_MODEL=llama-3.1-8b-instant
MAX_RETRIES_PER_TASK=3
SANDBOX_TIMEOUT_SECONDS=30
```

### Step 2: Start the Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Windows Tip (Application Control / Port Conflicts):**
> - If Windows Application Control blocks SQLAlchemy 2.1's compiled Cython `.pyd` extension, install pure-Python SQLAlchemy 2.0:
>   ```powershell
>   $env:DISABLE_SQLALCHEMY_CEXT="1"
>   .\.venv\Scripts\pip.exe install --force-reinstall --no-binary sqlalchemy "sqlalchemy==2.0.48"
>   ```
> - If port `8000` is already in use on your machine, start Uvicorn on another port (e.g. `--port 8001`) and create `frontend/.env.local`:
>   ```env
>   VITE_API_ORIGIN=http://127.0.0.1:8001
>   VITE_WS_ORIGIN=ws://127.0.0.1:8001
>   ```

### Step 3: Start the Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 9. Docker Deployment

To launch PostgreSQL 16 and the FastAPI backend via Docker Compose:

```powershell
docker compose up -d
```

Services started:
- `synapse-db`: PostgreSQL 16 Alpine exposed on `localhost:5433`
- `synapse-backend`: FastAPI server exposed on `localhost:8000`

---

## 10. Testing & Verification

### Automated Backend API Tests
```powershell
cd backend
.\.venv\Scripts\python.exe tests/test_api.py
```

### Live End-to-End Verification Results
- **Health Check**: `GET /health` returned `200 OK` with `status: "healthy"` and `10` registered agents ready.
- **End-to-End Autonomous Run**: Created project **TaskFlow AI** (`POST /api/v1/projects` -> `201 Created`) and executed the complete multi-agent DAG workflow to `completed` (`Current Step: Delivered`).
- **Generated Deliverables**: `12` code & documentation artifacts, `8/8` QA assertions passing (`100%`), `0` Critical / `0` High SAST findings, `94/100` Code Review score, `3,495` tokens processed (`$0.0025` estimated cost).
