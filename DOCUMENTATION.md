# SYNAPSE — Complete Technical & Product Documentation

> **Version:** 2.0.0  
> **Stack:** FastAPI · SQLAlchemy 2.0 · PostgreSQL 16 / SQLite · React 19 · TypeScript · Vite 8 · WebSockets · Groq LLM · Stripe · GitHub REST API

---

## 1. Platform Overview

**SYNAPSE** is an autonomous multi-agent AI software engineering platform that operates like a governed virtual software engineering company. Users submit a product specification, and 10 specialized AI engineering agents collaborate across requirements, system architecture, backend & frontend engineering, static code review, sandbox QA testing, SAST security auditing, technical documentation, and Docker deployment—with human-in-the-loop approval gates, full codebase ownership, and real-time WebSocket observability.

---

## 2. System Architecture

```mermaid
flowchart TB
    User["User / Engineering Team"] -->|HTTPS / WSS| FE["React 19 + TypeScript + Vite 8\n(Floating-Pill Shell + Ambient Neural Canvas)"]
    FE -->|REST / JWT Bearer| API["FastAPI Backend Engine (v2.0)\nSecurity Headers · Sliding-Window Rate Limiter"]
    FE -->|WebSocket Live Sync| WS["ConnectionManager (/ws/projects/{id}, /ws/global)"]

    API --> AUTH["Auth & Multi-Tenant RBAC\nPBKDF2-SHA256 · HS256 JWT · Password Reset"]
    API --> BILL["Billing & Quotas\nStripe Checkout · HMAC-SHA256 Webhooks"]
    API --> WF["10-Stage Autonomous Workflow Runner\nRetry Loops · Pause/Cancel · Approval Gates"]

    WF --> LLM["Groq LLM Client\n(Llama 3.3 70B / 3.1 8B + AST Validation)"]
    WF --> SB["CodeSandbox\n(Docker Isolated --network=none / Local Fallback)"]
    WF --> SAST["Deterministic SAST Scanner\n(OWASP / CWE-78, 79, 89, 95, 295, 798, 942)"]
    WF --> GIT["GitService + GitHub Push API"]

    API --> DB[("PostgreSQL 16\n(18 ORM Models + SQLite Local Fallback)")]
```

### Repository Layout
```text
SYNAPSE-CLONE/
├── backend/
│   ├── app/
│   │   ├── agents/          # 10 specialist AI agents (Supervisor -> Deployment)
│   │   ├── api/v1/          # 16 REST & WebSocket routers (auth, billing, projects, workflows, ...)
│   │   ├── core/            # config.py, llm.py, security.py, rate_limit.py
│   │   ├── db/              # models.py (18 tables), enums.py, seed.py, database.py
│   │   ├── schemas/         # Pydantic v2 request/response models
│   │   ├── services/        # sandbox.py, sast_scanner.py, git_service.py, report_service.py, architecture_service.py, audit.py
│   │   ├── workflows/       # runner.py, nodes.py, state.py
│   │   └── main.py          # FastAPI entrypoint, safe column migrator, /health
│   ├── alembic/             # Database migrations
│   ├── tests/               # test_api.py (16 unit) + test_integration.py (7 integration/security, incl. test_normalize_database_url)
│   ├── Dockerfile           # Multi-stage, non-root `synapse` user, git + curl HEALTHCHECK
│   └── .env.example         # Complete environment configuration template
├── frontend/
│   ├── public/              # synapse-logo.jpg favicon
│   └── src/
│       ├── assets/          # Bespoke 5-node neural star Synapse logo
│       ├── components/
│       │   ├── layout/      # AppLayout.tsx, TopNav.tsx (Floating Pill + Sub-Rail)
│       │   └── ui/          # AmbientCanvas, SynapseLogo, AgentGlyph, ConfirmModal, ErrorBoundary, PageState
│       ├── context/         # AuthContext.tsx, ToastContext.tsx
│       ├── hooks/           # useWebSocket.ts
│       ├── pages/           # 21 pages (Landing, Pricing, Auth, Legal, Overview, WorkflowStudio, ...)
│       └── services/        # api.ts (JWT-aware HTTP client), demoData.ts
├── docs/                    # Synapse_Phase_1_2_Implementation_Report.pdf
├── screenshots/             # 1440x900 live UI screenshots
└── docker-compose.yml       # PostgreSQL 16 + FastAPI backend stack
```

---

## 3. The 10 Specialized AI Agents

| Stage | Agent Identity | Role Key | Core Responsibility |
|---|---|---|---|
| **01** | **Alex Vance** | `supervisor` | Orchestrates the 10-stage execution plan, dependency graph, and delivery gating |
| **02** | **Sarah Chen** | `product_manager` | Produces structured PRDs, user stories, functional requirements, and MVP scope |
| **03** | **Marcus Aurelius** | `system_architect` | Designs system topology, API contracts, relational schemas, and ADRs |
| **04** | **David Thorne** | `backend_developer` | Generates FastAPI endpoints, Pydantic models, and DB layers (with Python AST validation) |
| **05** | **Elena Rostova** | `frontend_developer` | Builds modular React 19 + TypeScript components and API integrations |
| **06** | **Claire Dupont** | `code_reviewer` | Performs static peer reviews across architecture boundaries and type safety |
| **07** | **Tariq Mansour** | `qa_engineer` | Generates pytest suites, verifies Python AST syntax, and runs isolated sandbox tests |
| **08** | **Aiden Cross** | `security_agent` | Executes deterministic OWASP/CWE SAST scans across all generated artifacts |
| **09** | **Maya Patel** | `documentation_agent` | Authors READMEs, runbooks, OpenAPI docs, and 18-section delivery dossiers |
| **10** | **Devon Brooks** | `deployment_agent` | Produces production Dockerfiles, Compose manifests, and healthcheck configs |

---

## 4. Complete Feature Reference

### Commercial & Onboarding Experience
- **Public Landing Page (`/`)**: Interactive 10-Agent Pipeline Simulator where visitors enter any app idea (or pick presets) and watch all 10 color-coded agents coordinate live, plus 1-click **Launch Live Demo Workspace**.
- **Authentication & Recovery (`/login`, `/register`)**: Email/password registration, login, 1-click Demo Workspace login (`demo@synapse.ai`), and time-limited signed **Password Reset** (`/api/v1/auth/forgot-password` & `/reset-password`).
- **Pricing & Stripe Billing (`/pricing`)**: Starter ($0, 3 projects), Pro ($49/mo or $39/mo annual, unlimited), and Enterprise (custom) tiers wired to `/api/v1/billing/checkout` (live Stripe Checkout when configured, or self-hosted plan switch) and `/api/v1/billing/webhook` with HMAC-SHA256 signature verification.
- **Legal & Support (`/terms`, `/privacy`, `/support`)**: Terms of Service, Privacy Policy, and Support/Enterprise contact hub.

### Core Engineering Workspace (`/app/*`)
- **Command Center (`/app`)**: Executive overview with live KPI strip (Projects, Agent Executions, Avg Stage Latency, Inference Spend), Quick-Start Onboarding checklist, Active Pipelines, 10-Stage Autonomous Lifecycle, and Workforce Fleet.
- **Projects & Creation (`/app/projects`, `/app/projects/new`, `/app/projects/:id`)**: Debounced search, status filtering, dynamic tech-stack selection per project type, Human Approval Gate toggle, and Starter plan quota enforcement (`402 Payment Required`).
- **Agent Workforce (`/app/agents`)**: 10 bespoke geometric `AgentGlyph` symbols, live status & reliability gauges, and a sticky System Prompt & Guardrails inspector.
- **Workflow Studio (`/app/workflows`)**: Interactive drag-to-pan & zoomable node graph with live WebSocket updates, dynamic SVG edges mapped to `workflow.edges`, Start/Pause/Resume/Cancel controls, and inline Human Approval Gate banner.
- **Code Workspace (`/app/code`)**: Multi-file artifact browser, line-numbered code viewer, clipboard copy, and Zip-Slip-hardened full codebase ZIP export.
- **Testing & QA (`/app/testing`)**: Real Python AST syntax verification and pytest sandbox execution (`Docker --network=none --read-only` when `SANDBOX_MODE=docker`, or sanitized local fallback) with real pass/fail/skipped diagnostics.
- **Security Center (`/app/security`)**: Deterministic SAST static analysis scanning stored project artifacts for CWE-798 (hardcoded secrets), CWE-95 (`eval`/`exec`), CWE-78 (`shell=True`), CWE-89 (SQL interpolation), CWE-942 (wildcard CORS), CWE-79 (`dangerouslySetInnerHTML`), and CWE-295 (`verify=False`).
- **Approvals Center (`/app/approvals`)**: Human-in-the-loop sign-off queue displaying real PRD and architecture evidence from `metadata_json`.
- **Architecture Intelligence (`/app/architecture`)**: Component topology, ADRs, API contract table, and relational DB schema explorer.
- **Git & Releases (`/app/git`)**: Commit history, Pull Requests with merge actions, branches, and **Push to GitHub** modal powered by the GitHub Contents REST API.
- **Engineering Delivery Reports (`/app/reports`)**: Live 18-section release dossier computed from real DB records with Markdown download and Print/PDF export.
- **Analytics & ROI (`/app/analytics`)**: Live per-agent workload distribution, model token/cost breakdown, and interactive ROI Projection Simulator.
- **Audit Logs (`/app/audit`)**: Append-only event trail with event-type filtering and raw JSON detail modal.
- **Persistent Settings (`/app/settings`)**: Live DB/Agent/Groq health cards + DB-persisted workspace name, LLM routing models, retry limits, sandbox timeout, and governance toggles.

---

## 5. REST & WebSocket API Reference

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health`, `/api/v1/health` | Live DB dialect, registered agents count, and Groq config status |
| **Auth** | `POST` | `/api/v1/auth/register` | Create user + isolated workspace, returns HS256 JWT |
| | `POST` | `/api/v1/auth/login` | Authenticate credentials, returns HS256 JWT |
| | `POST` | `/api/v1/auth/demo-login` | One-click sign-in to seeded SYNAPSE HQ workspace |
| | `GET` | `/api/v1/auth/me` | Return authenticated user & workspace profile |
| | `POST` | `/api/v1/auth/forgot-password` | Issue 30-minute signed password reset token |
| | `POST` | `/api/v1/auth/reset-password` | Validate reset token and update PBKDF2 password hash |
| **Billing** | `GET` | `/api/v1/billing/status` | Workspace plan, project quota usage, Stripe status |
| | `POST` | `/api/v1/billing/checkout` | Create Stripe Checkout Session or switch self-hosted plan |
| | `POST` | `/api/v1/billing/webhook` | Verified Stripe HMAC-SHA256 subscription webhook handler |
| **Settings** | `GET`, `PUT` | `/api/v1/settings` | Read and persist workspace LLM & execution guardrails |
| **Projects** | `GET`, `POST` | `/api/v1/projects` | Workspace-scoped project list & creation (enforces quotas) |
| | `GET`, `PUT`, `DELETE` | `/api/v1/projects/{id}` | Project CRUD & full `/details` endpoint |
| **Workflows** | `GET` | `/api/v1/workflows/project/{id}` | Fetch workflow graph (`nodes` & `edges`) |
| | `POST` | `/api/v1/workflows/{id}/{start,pause,resume,cancel}` | Control autonomous multi-agent execution |
| **Agents & Tasks** | `GET` | `/api/v1/agents`, `/api/v1/tasks` | Agent roster, live metrics, task queue, and task retry |
| **Artifacts** | `GET` | `/api/v1/artifacts/project/{id}` | List generated files, tree, and `/download` ZIP archive |
| **QA & Security** | `GET`, `POST` | `/api/v1/testing/project/{id}[/execute]` | List or run real AST + sandbox pytest verification |
| | `GET`, `POST` | `/api/v1/security/project/{id}[/execute]` | List or run real deterministic SAST static audit |
| **Git & GitHub** | `GET`, `POST` | `/api/v1/git/project/{id}/{commits,pull-requests,push-github}` | Commits, PR merge, and direct GitHub REST API push |
| **Governance** | `GET`, `POST` | `/api/v1/approvals`, `/api/v1/architecture/project/{id}`, `/api/v1/reports/project/{id}`, `/api/v1/audit/logs`, `/api/v1/analytics/*` | Approvals, ADRs, delivery dossiers, audit logs, telemetry |
| **WebSocket** | `WS` | `/ws/projects/{project_id}`, `/ws/global` | Real-time execution and stage completion stream |

---

## 6. Database Schema (18 SQLAlchemy Models)

Defined in `backend/app/db/models.py` using cross-platform `JSON_TYPE` (`JSONB` on PostgreSQL, `JSON` on SQLite):
- **Identity & Tenancy:** `User` (with `password_hash`), `Workspace` (with `plan`, `settings_json`), `Project`
- **Orchestration:** `Agent`, `Workflow`, `WorkflowNode`, `WorkflowEdge`, `Task`, `Execution`, `AgentMessage`
- **Artifacts & Verification:** `Artifact`, `TestRun`, `TestResult`, `SecurityScan`, `SecurityFinding`
- **Governance & Telemetry:** `ApprovalRequest`, `AuditLog`, `LLMUsageRecord`

---

## 7. Security Architecture

- **Authentication:** PBKDF2-HMAC-SHA256 (`120,000` iterations, per-user random salt) + HS256 JWT (`JWT_SECRET_KEY`).
- **Multi-Tenant Isolation:** `resolve_active_workspace_id()` scopes project reads/writes to the authenticated user's workspace; set `REQUIRE_AUTH=true` in production to reject unauthenticated requests with `401`.
- **Middleware:** Pure-ASGI `SecurityAndRateLimitMiddleware` injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and enforces per-IP sliding-window rate limiting (`RATE_LIMIT_PER_MINUTE`).
- **Filesystem & Archive Hardening:** Path traversal containment checks in `GitService` and `CodeSandbox`, Zip Slip path-segment stripping in `artifacts.py`, sanitized quoted `Content-Disposition` headers in `artifacts.py` and `reports.py`.
- **Container Hardening:** Multi-stage `backend/Dockerfile` runs as non-root `USER synapse` with `HEALTHCHECK` and `.dockerignore`.

---

## 8. Environment Variables (`backend/.env`)

```env
PROJECT_NAME=SYNAPSE
API_V1_STR=/api/v1
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://user:password@host:5432/synapse_db

# Security & Multi-Tenancy
JWT_SECRET_KEY=<generate-64-char-random-secret>
JWT_EXPIRE_MINUTES=1440
REQUIRE_AUTH=true
CORS_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_PER_MINUTE=240

# LLM Provider
GROQ_API_KEY=gsk_...
GROQ_PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_FAST_MODEL=llama-3.1-8b-instant

# Billing (Stripe) & GitHub Export
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
FRONTEND_URL=https://your-frontend-domain.com
GITHUB_TOKEN=

# Sandbox & Execution
MAX_RETRIES_PER_TASK=3
SANDBOX_TIMEOUT_SECONDS=30
SANDBOX_MODE=docker
```

---

## 9. Testing & Production Cloud Deployment (Phase 5)

### Run Automated Verification
```powershell
# Backend unit, integration & security suite (23 tests)
cd backend
.\.venv\Scripts\pytest.exe tests/ -v

# Frontend TypeScript check, production build & lint
cd frontend
npm run build
npm run lint
```

### Live Production Deployment

| Service | Host | Endpoint / Configuration | Status |
|---|---|---|---|
| **Live Web App (Frontend)** | **Vercel** (`Hobby`, Root: `frontend`) | `https://synapse-ai-platform-inky.vercel.app` | Live |
| **Live Backend API & WS** | **Railway** (`Docker`, Root: `/backend`) | `https://synapse-ai-platform-production.up.railway.app` | Live |
| **Interactive Swagger Docs** | Railway FastAPI OpenAPI | `https://synapse-ai-platform-production.up.railway.app/docs` | Live |
| **Health & Groq Check** | Railway FastAPI | `https://synapse-ai-platform-production.up.railway.app/health` (`llm.configured: true`, `10` agents) | Healthy |
| **LLM Inference** | **Groq Cloud** | `llama-3.3-70b-versatile` (primary) + `llama-3.1-8b-instant` (fast) | Configured |
| **Static Showcase Demo** | **GitHub Pages** (`gh-pages`) | `https://mayarmajed2.github.io/SYNAPSE-AI-Platform/` (`VITE_DEMO_MODE=true`) | Live |

### Cloud Deployment Architecture & Blueprints
1. **Database:** Supports PostgreSQL 16 (normalized via `_normalize_database_url()` for Neon, Supabase, Render, or Railway) with automatic local SQLite fallback when `DATABASE_URL` is offline; run `alembic upgrade head` for managed migrations.
2. **Backend API:** Deployed from `backend/Dockerfile` with `ENVIRONMENT=production`, `SANDBOX_MODE=local`, `GROQ_API_KEY`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, and `FRONTEND_URL` (`render.yaml` is also included for Render Blueprint deploys).
3. **Frontend App:** Deployed from `frontend/` using `frontend/vercel.json` SPA rewrites with `VITE_API_ORIGIN`, `VITE_WS_ORIGIN`, and `VITE_DEMO_MODE=false`.
4. **Stripe Webhook (Optional):** Point Stripe Dashboard webhook to `https://synapse-ai-platform-production.up.railway.app/api/v1/billing/webhook` for `checkout.session.completed` and `customer.subscription.deleted`.
