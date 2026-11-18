"""Architecture Intelligence Service for SYNAPSE.

Generates interactive system topology, component relationship graphs, database ER models,
API contracts, and Architecture Decision Records (ADRs).
"""

from typing import Any, Dict, List


class ArchitectureService:
    @classmethod
    def analyze_architecture(cls, project_name: str, architecture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Produce deep structural architecture intelligence from project design."""
        tech_stack = architecture_data.get("tech_stack", {})
        db_tables = architecture_data.get("database_tables", [])
        endpoints = architecture_data.get("api_endpoints", [])

        # Default standard topology nodes if none defined
        components = [
            {
                "id": "comp-client",
                "name": "Single-Page Web Application",
                "type": "frontend",
                "tech": tech_stack.get("frontend", "React 19, TypeScript, Vite"),
                "responsibilities": ["State management", "Interactive views", "API client consumption", "Client-side validation"],
                "status": "implemented",
            },
            {
                "id": "comp-gateway",
                "name": "API Gateway / HTTP Router",
                "type": "gateway",
                "tech": "FastAPI ASGI Router + CORS Middleware",
                "responsibilities": ["Request routing", "Payload deserialization", "Rate limiting", "Authentication headers"],
                "status": "implemented",
            },
            {
                "id": "comp-backend",
                "name": "Core Application Service",
                "type": "backend",
                "tech": tech_stack.get("backend", "FastAPI, Pydantic v2"),
                "responsibilities": ["Business logic execution", "Data integrity validation", "Domain transactions"],
                "status": "implemented",
            },
            {
                "id": "comp-database",
                "name": "Relational Persistence Layer",
                "type": "database",
                "tech": tech_stack.get("database", "PostgreSQL 16 / SQLAlchemy 2.0"),
                "responsibilities": ["ACID relational persistence", "Entity constraints", "Foreign key cascades"],
                "status": "implemented",
            },
            {
                "id": "comp-cache",
                "name": "In-Memory Session & Cache",
                "type": "cache",
                "tech": "Redis / In-Memory Store",
                "responsibilities": ["Session tokens", "Rate limit counters", "High-frequency caching"],
                "status": "planned",
            },
        ]

        # Topology connections
        connections = [
            {"from": "comp-client", "to": "comp-gateway", "protocol": "HTTPS / JSON", "nature": "Asynchronous REST + WebSockets"},
            {"from": "comp-gateway", "to": "comp-backend", "protocol": "Internal ASGI", "nature": "In-process dispatch"},
            {"from": "comp-backend", "to": "comp-database", "protocol": "SQL (psycopg/pg)", "nature": "Connection pooled transactions"},
            {"from": "comp-backend", "to": "comp-cache", "protocol": "RESP TCP", "nature": "Sub-millisecond key-value lookups"},
        ]

        # Standard Architecture Decision Records (ADRs)
        adrs = [
            {
                "id": "ADR-001",
                "title": "Use FastAPI with Pydantic v2 for Asynchronous Backend",
                "status": "Accepted",
                "date": "2026-11-03",
                "decision": "Adopted FastAPI due to native async coroutine concurrency, high throughput, and automatic OpenAPI schema generation.",
                "consequences": "Requires non-blocking database drivers and async query execution patterns.",
            },
            {
                "id": "ADR-002",
                "title": "Decoupled Single-Page Architecture with React & TypeScript",
                "status": "Accepted",
                "date": "2026-11-03",
                "decision": "Separated client UI from backend services via clean REST contracts and real-time WebSockets.",
                "consequences": "Enables independent scaling, deployment, and localized component state isolation.",
            },
            {
                "id": "ADR-003",
                "title": "Relational Schema with Strict Foreign Key Cascades",
                "status": "Accepted",
                "date": "2026-11-03",
                "decision": "Employed PostgreSQL relational models with parameterized SQLAlchemy ORM to guarantee data integrity and eliminate SQL injection.",
                "consequences": "Requires formal schema migration pipelines across staging and production.",
            },
            {
                "id": "ADR-004",
                "title": "Non-Root Containerized Microservices with Healthcheck Probes",
                "status": "Accepted",
                "date": "2026-11-03",
                "decision": "Container images execute under unprivileged user 'synapse' (UID 1001) with explicit HTTP liveness probes.",
                "consequences": "Prevents container breakout vulnerabilities and satisfies enterprise security standards.",
            },
        ]

        # Normalizing database entities for ER diagram
        entities = []
        if db_tables:
            for t in db_tables:
                entities.append({
                    "table_name": t.get("table_name", "items"),
                    "columns": t.get("columns", ["id (UUID)", "title (VARCHAR)", "status (VARCHAR)", "created_at (TIMESTAMP)"]),
                    "relationships": t.get("relationships", "Independent entity"),
                })
        else:
            entities = [
                {
                    "table_name": "items",
                    "columns": ["id (UUID PK)", "title (VARCHAR(255))", "description (TEXT)", "status (VARCHAR(50))", "created_at (TIMESTAMP)"],
                    "relationships": "Belongs to Project workspace",
                },
                {
                    "table_name": "users",
                    "columns": ["id (UUID PK)", "email (VARCHAR(255) UNIQUE)", "full_name (VARCHAR(255))", "role (VARCHAR(50))"],
                    "relationships": "Has many Projects and AuditLogs",
                },
            ]

        return {
            "project_name": project_name,
            "architecture_overview": architecture_data.get("architecture_overview", "Decoupled Modern SaaS Architecture"),
            "tech_stack": tech_stack,
            "components": components,
            "connections": connections,
            "entities": entities,
            "adrs": adrs,
            "endpoints": endpoints,
        }

