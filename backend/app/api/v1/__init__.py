from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.billing import router as billing_router
from app.api.v1.settings import router as settings_router
from app.api.v1.projects import router as projects_router
from app.api.v1.agents import router as agents_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.artifacts import router as artifacts_router
from app.api.v1.testing import router as testing_router
from app.api.v1.security import router as security_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit import router as audit_router
from app.api.v1.git import router as git_router
from app.api.v1.architecture import router as architecture_router
from app.api.v1.reports import router as reports_router
from app.api.v1.websocket import router as ws_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(workflows_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(artifacts_router)
api_v1_router.include_router(testing_router)
api_v1_router.include_router(security_router)
api_v1_router.include_router(approvals_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(git_router)
api_v1_router.include_router(architecture_router)
api_v1_router.include_router(reports_router)

__all__ = ["api_v1_router", "ws_router"]

