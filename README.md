# SYNAPSE — Autonomous AI Software Engineering Platform

> A virtual software engineering company where 9 specialized AI agents collaborate across requirements, architecture, frontend, backend, code review, QA, security, and documentation to build enterprise-grade software.

---

## 🏛️ System Architecture

```text
                                  +-----------------------+
                                  |     User / Client     |
                                  +-----------+-----------+
                                              |
                                              v
                              +-------------------------------+
                              |    Vite + React 19 Frontend   |
                              |   Enterprise SaaS Dashboard   |
                              +---------------+---------------+
                                              |  HTTP / WebSocket
                                              v
                              +-------------------------------+
                              |      FastAPI Backend Engine   |
                              +---------------+---------------+
                                              |
              +-------------------------------+-------------------------------+
              |                               |                               |
              v                               v                               v
    +-------------------+           +-------------------+           +-------------------+
    |    PostgreSQL 16  |           |     Groq LLM      |           | WebSocket Engine  |
    |  (18 Data Models) |           | (Llama 3.3 / 3.1) |           |  (Real-Time Sync) |
    +-------------------+           +-------------------+           +-------------------+
```

---

## 👥 The 9 Specialized AI Agents

| # | Agent | Role | Identity | Key Responsibility |
|---|---|---|---|---|
| 1 | **Supervisor** | `supervisor` | Alex Vance | Orchestrator, task decomposition, dependency graph, delivery gatekeeper |
| 2 | **Product Manager** | `product_manager` | Sarah Chen | Product Requirements Document (PRD), user stories, acceptance criteria |
| 3 | **System Architect** | `system_architect` | Marcus Aurelius | Tech stack selection, API specifications, relational schemas |
| 4 | **Backend Developer** | `backend_developer` | David Thorne | FastAPI endpoints, Pydantic schemas, database queries |
| 5 | **Frontend Developer** | `frontend_developer` | Elena Rostova | React 19, TypeScript components, state management, API integration |
| 6 | **Code Reviewer** | `code_reviewer` | Claire Dupont | Static code analysis, anti-pattern detection, architectural consistency |
| 7 | **QA Engineer** | `qa_engineer` | Tariq Mansour | Automated pytest suites, test execution, regression diagnostics |
| 8 | **Security Agent** | `security_agent` | Aiden Cross | SAST analysis, OWASP Top 10 compliance, secrets audit |
| 9 | **Documentation Agent** | `documentation_agent` | Maya Patel | README creation, runbooks, OpenAPI docs, changelogs |

---

## 🚀 Quick Start Guide

### 1. Database Setup (PostgreSQL)

You can run PostgreSQL via Docker:

```powershell
# Run the pre-configured PostgreSQL container
docker run -d --name synapse-db -p 5433:5432 -e POSTGRES_DB=synapse_db -e POSTGRES_USER=synapse -e POSTGRES_PASSWORD=synapse_dev_2026 postgres:16-alpine
```

Or using Docker Compose:
```powershell
docker compose up -d db
```

### 2. Backend Setup (FastAPI)

```powershell
cd backend

# Create virtual environment if not created
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend server (Auto-migrates & seeds the 9 agents on startup!)
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

The backend will be live at:
- **API**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup (React + Vite)

```powershell
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ API Endpoints Summary

| Group | Method | Path | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | Live system and database health check |
| **Projects** | `GET` | `/api/v1/projects` | List projects with search & filtering |
| | `POST` | `/api/v1/projects` | Create a new project & generate workflow graph |
| | `GET` | `/api/v1/projects/{id}` | Get project summary |
| | `GET` | `/api/v1/projects/{id}/details` | Full details (workflow, artifacts, tests, security) |
| | `DELETE` | `/api/v1/projects/{id}` | Delete project |
| **Workflows** | `GET` | `/api/v1/workflows/project/{project_id}` | Get full workflow graph with nodes and edges |
| | `POST` | `/api/v1/workflows/{id}/start` | Trigger autonomous multi-agent execution |
| | `POST` | `/api/v1/workflows/{id}/pause` | Pause active execution |
| | `POST` | `/api/v1/workflows/{id}/resume` | Resume execution |
| | `POST` | `/api/v1/workflows/{id}/cancel` | Cancel active execution |
| **Approvals** | `GET` | `/api/v1/approvals` | List approval requests |
| | `POST` | `/api/v1/approvals/{id}/resolve` | Approve or reject a human gate request |
| **Artifacts** | `GET` | `/api/v1/artifacts/project/{id}` | List project generated code & docs |
| | `GET` | `/api/v1/artifacts/project/{id}/tree` | Get nested file tree |
| | `GET` | `/api/v1/artifacts/project/{id}/download` | Download full codebase as `.zip` archive |
| **Testing** | `GET` | `/api/v1/testing/project/{id}` | Get QA test runs |
| | `POST` | `/api/v1/testing/project/{id}/execute` | Run automated test suite |
| **Security** | `GET` | `/api/v1/security/project/{id}` | Get security scans & findings |
| | `POST` | `/api/v1/security/project/{id}/execute` | Run SAST vulnerability audit |
| **Analytics** | `GET` | `/api/v1/analytics/overview` | Platform-wide KPIs & cost estimates |
| | `GET` | `/api/v1/analytics/agents` | Per-agent workload & success metrics |
| | `GET` | `/api/v1/analytics/usage` | LLM token consumption breakdown |
| **WebSocket** | `WS` | `/api/v1/ws/projects/{project_id}` | Real-time project execution stream |
| | `WS` | `/api/v1/ws/global` | Global platform notifications stream |

---

## 🎨 Enterprise Design System

- **Background**: `#F7F8FA`
- **Primary Accent**: `#315EFB`
- **Text Primary**: `#17191C`
- **Text Secondary**: `#747B86`
- **Borders**: `#E8EAED`
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

---

## 🧪 Testing

```powershell
cd backend
.\.venv\Scripts\python.exe tests/test_api.py
```
