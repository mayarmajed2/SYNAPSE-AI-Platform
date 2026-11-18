"""Deployment Agent: Crafts container specifications, Docker Compose networks, CI/CD runbooks, and staging readiness."""

from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.core.llm import llm_client


class DeploymentAgent:
    ROLE = "deployment_agent"
    NAME = "Devon Brooks"

    @classmethod
    def generate_deployment_manifests(
        cls,
        project_name: str,
        architecture: Dict[str, Any],
        db: Session = None,
        project_id: str = None,
    ) -> List[Dict[str, str]]:
        """Generate production containerization files, Docker compose networks, and health check runbooks."""
        system_prompt = (
            "You are the Deployment Agent at SYNAPSE. Create production container configurations: "
            "Dockerfile for backend, Dockerfile for frontend, docker-compose.yml with health checks, "
            "and an environment template (.env.example)."
        )
        user_prompt = f"Project: {project_name}\nArchitecture: {architecture.get('tech_stack', {})}\nGenerate deployment infrastructure manifests."

        res = llm_client.generate_structured(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            db=db,
            project_id=project_id,
            agent_name=cls.NAME,
        )

        dockerfile_backend = f'''# SYNAPSE Automated Multi-Stage Dockerfile for {project_name} Backend
FROM python:3.11-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim as runner
WORKDIR /app
RUN useradd -m -u 1001 synapse
COPY --from=builder /root/.local /home/synapse/.local
COPY . .

ENV PATH=/home/synapse/.local/bin:$PATH
USER synapse
EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'''

        docker_compose = f'''version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: {project_name.lower().replace(" ", "-")}-db
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_dev_password_2026
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d app_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: {project_name.lower().replace(" ", "-")}-api
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:secure_dev_password_2026@db:5432/app_db
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: {project_name.lower().replace(" ", "-")}-ui
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  pgdata:
'''

        env_example = f'''# Environment template for {project_name}
PROJECT_NAME={project_name}
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://postgres:secure_dev_password_2026@localhost:5432/app_db
PORT=8000
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
'''

        k8s_deployment = f'''apiVersion: apps/v1
kind: Deployment
metadata:
  name: {project_name.lower().replace(" ", "-")}-api
  labels:
    app: {project_name.lower().replace(" ", "-")}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {project_name.lower().replace(" ", "-")}
  template:
    metadata:
      labels:
        app: {project_name.lower().replace(" ", "-")}
    spec:
      containers:
      - name: api
        image: {project_name.lower().replace(" ", "-")}:latest
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
'''

        return [
            {"path": "deploy/Dockerfile", "filename": "Dockerfile", "language": "dockerfile", "content": dockerfile_backend, "type": "deployment"},
            {"path": "deploy/docker-compose.yml", "filename": "docker-compose.yml", "language": "yaml", "content": docker_compose, "type": "deployment"},
            {"path": "deploy/.env.example", "filename": ".env.example", "language": "bash", "content": env_example, "type": "deployment"},
            {"path": "deploy/k8s-deployment.yaml", "filename": "k8s-deployment.yaml", "language": "yaml", "content": k8s_deployment, "type": "deployment"},
        ]

