"""System Architect Agent: Designs scalable architecture, database schema, and API contracts."""

from typing import Any, Dict
from sqlalchemy.orm import Session
from app.core.llm import llm_client


class ArchitectAgent:
    ROLE = "system_architect"
    NAME = "Marcus Aurelius"

    @classmethod
    def design_system(cls, project_name: str, prd: Dict[str, Any], db: Session = None, project_id: str = None) -> Dict[str, Any]:
        """Produce system architecture specifications, relational schema, and API contract."""
        system_prompt = (
            "You are the System Architect Agent at SYNAPSE. Create technical architecture documentation: "
            "tech_stack (frontend, backend, database, cache, auth), api_endpoints (method, path, description, request_body, response), "
            "database_tables (table_name, columns, relationships), and architecture_overview."
        )
        user_prompt = f"Project: {project_name}\nPRD Context: {prd.get('overview', '')}\nFunctional Reqs: {prd.get('functional_requirements', [])}"

        res = llm_client.generate_structured(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            db=db,
            project_id=project_id,
            agent_name=cls.NAME,
        )

        if not res or "api_endpoints" not in res:
            return {
                "project_name": project_name,
                "architecture_overview": "3-Tier Decoupled Architecture with Vite React frontend, FastAPI asynchronous backend, and PostgreSQL relational persistence.",
                "tech_stack": {
                    "frontend": "React 19, TypeScript, Tailwind CSS, TanStack Query",
                    "backend": "FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM",
                    "database": "PostgreSQL 16",
                    "communication": "REST APIs + WebSockets",
                },
                "api_endpoints": [
                    {"method": "GET", "path": "/api/v1/health", "description": "Liveness and database connectivity probe"},
                    {"method": "GET", "path": "/api/v1/items", "description": "List entities with pagination and search"},
                    {"method": "POST", "path": "/api/v1/items", "description": "Create new entity with Pydantic validation"},
                    {"method": "GET", "path": "/api/v1/items/{id}", "description": "Retrieve entity by unique identifier"},
                    {"method": "PUT", "path": "/api/v1/items/{id}", "description": "Update entity attributes"},
                    {"method": "DELETE", "path": "/api/v1/items/{id}", "description": "Remove entity record"},
                ],
                "database_tables": [
                    {
                        "table_name": "items",
                        "columns": ["id (UUID PK)", "title (VARCHAR)", "description (TEXT)", "status (VARCHAR)", "created_at (TIMESTAMP)"],
                        "relationships": "Belongs to Workspace or Project entity",
                    }
                ],
            }

        return res

