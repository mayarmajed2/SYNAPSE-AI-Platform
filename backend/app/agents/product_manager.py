"""Product Manager Agent: Formulates structured PRD, user stories, and acceptance criteria."""

from typing import Any, Dict
from sqlalchemy.orm import Session
from app.core.llm import llm_client


class ProductManagerAgent:
    ROLE = "product_manager"
    NAME = "Sarah Chen"

    @classmethod
    def generate_prd(cls, project_name: str, idea: str, db: Session = None, project_id: str = None) -> Dict[str, Any]:
        """Synthesize product requirements document."""
        system_prompt = (
            "You are the Product Manager Agent at SYNAPSE. Generate a comprehensive Product Requirements Document (PRD). "
            "Include: product_overview, target_personas, functional_requirements, non_functional_requirements, "
            "user_stories (each with title, persona, action, outcome, and acceptance_criteria), and mvp_scope."
        )
        user_prompt = f"Project Name: {project_name}\nProject Vision: {idea}\nGenerate complete PRD specification."

        res = llm_client.generate_structured(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            db=db,
            project_id=project_id,
            agent_name=cls.NAME,
        )

        if not res or "user_stories" not in res:
            return {
                "project_name": project_name,
                "overview": f"A modern enterprise-grade software solution designed to solve: {idea}",
                "target_personas": [
                    {"persona": "Primary User", "need": "Frictionless workflow, intuitive interface, reliable execution"},
                    {"persona": "System Administrator", "need": "Role-based access, audit visibility, and security governance"},
                ],
                "functional_requirements": [
                    "User authentication and session security",
                    "Core workflow data creation, reading, updating, and deletion",
                    "Interactive real-time dashboards and status indicators",
                    "Automated error handling with actionable recovery feedback",
                ],
                "non_functional_requirements": [
                    "Sub-200ms API response latency on standard read queries",
                    "Zero plain-text secret exposure across logs and responses",
                    "Responsive layout compatible with desktop, tablet, and mobile",
                ],
                "user_stories": [
                    {
                        "id": "US-01",
                        "title": "Onboarding & Access",
                        "story": "As an authorized user, I want to securely authenticate so that my workspace is protected.",
                        "acceptance_criteria": [
                            "Given valid credentials, user receives token and lands on overview dashboard.",
                            "Given invalid credentials, user sees clean error message without leaking sensitive internals.",
                        ],
                    },
                    {
                        "id": "US-02",
                        "title": "Core Workload Management",
                        "story": "As a user, I want to manage primary resources and inspect their real-time state.",
                        "acceptance_criteria": [
                            "User can create, filter, search, and update records.",
                            "Real-time status changes reflect automatically without manual page refresh.",
                        ],
                    },
                ],
                "mvp_scope": {
                    "in_scope": ["Core CRUD API", "Modern React UI", "Database persistence", "Audit logging"],
                    "future_scope": ["Multi-tenant billing", "Advanced analytics export", "Third-party webhooks"],
                },
            }

        return res

