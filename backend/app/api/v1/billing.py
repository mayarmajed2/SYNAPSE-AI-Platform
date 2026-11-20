"""Commercial Billing, Plan Quotas, and Stripe Checkout / Webhook API."""
import hashlib
import hmac
import json
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_optional_user
from app.db.database import get_db
from app.db.models import Project, User, Workspace

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])

PLAN_QUOTAS = {
    "starter": {"name": "Starter", "max_projects": 3, "monthly_usd": 0, "annual_usd": 0},
    "pro": {"name": "Pro", "max_projects": None, "monthly_usd": 49, "annual_usd": 39},
    "enterprise": {"name": "Enterprise", "max_projects": None, "monthly_usd": None, "annual_usd": None},
}


class CheckoutRequest(BaseModel):
    plan: str = Field(..., pattern="^(starter|pro|enterprise)$")
    billing_cycle: str = Field("annual", pattern="^(monthly|annual)$")


def _get_workspace(db: Session, user: Optional[User]) -> Workspace:
    ws = None
    if user:
        ws = db.query(Workspace).filter(Workspace.owner_id == user.id).first()
    if not ws:
        ws = db.query(Workspace).filter(Workspace.slug == "default-workspace").first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


@router.get("/status")
def get_billing_status(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Return active workspace plan, project quota usage, and Stripe readiness."""
    ws = _get_workspace(db, current_user)
    plan_key = (getattr(ws, "plan", "pro") or "pro").lower()
    quota = PLAN_QUOTAS.get(plan_key, PLAN_QUOTAS["pro"])
    used_projects = db.query(Project).filter(Project.workspace_id == ws.id).count()

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "plan": plan_key,
        "plan_name": quota["name"],
        "projects_used": used_projects,
        "projects_limit": quota["max_projects"],
        "quota_exceeded": quota["max_projects"] is not None and used_projects >= quota["max_projects"],
        "stripe_configured": bool(settings.STRIPE_SECRET_KEY),
        "plans": PLAN_QUOTAS,
    }


@router.post("/checkout")
async def create_checkout_session(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Create a Stripe Checkout session (when configured) or switch plan in self-hosted mode."""
    ws = _get_workspace(db, current_user)

    if payload.plan == "enterprise":
        return {
            "mode": "contact_sales",
            "message": "Enterprise deployment inquiries are handled via enterprise@synapse.ai",
            "plan": ws.plan,
        }

    # Live Stripe Checkout when credentials are provided
    if payload.plan == "pro" and settings.STRIPE_SECRET_KEY and settings.STRIPE_PRO_PRICE_ID:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://api.stripe.com/v1/checkout/sessions",
                    headers={"Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}"},
                    data={
                        "mode": "subscription",
                        "line_items[0][price]": settings.STRIPE_PRO_PRICE_ID,
                        "line_items[0][quantity]": "1",
                        "success_url": f"{settings.FRONTEND_URL}/app/settings?upgrade=success",
                        "cancel_url": f"{settings.FRONTEND_URL}/pricing?upgrade=cancelled",
                        "client_reference_id": ws.id,
                        "metadata[workspace_id]": ws.id,
                        "metadata[plan]": payload.plan,
                    },
                )
            if resp.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Stripe error: {resp.text[:200]}")
            data = resp.json()
            return {
                "mode": "stripe",
                "checkout_url": data.get("url"),
                "session_id": data.get("id"),
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Could not reach Stripe API: {e}")

    # Self-hosted / sandbox immediate plan switch
    ws.plan = payload.plan
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return {
        "mode": "self_hosted",
        "plan": ws.plan,
        "message": f"Workspace switched to {ws.plan.upper()} plan (Stripe keys not configured; running in self-hosted mode).",
    }


def verify_stripe_signature(payload_body: bytes, sig_header: str, secret: str) -> bool:
    """Verify Stripe-Signature HMAC-SHA256 webhook header."""
    if not sig_header or not secret:
        return False
    parts = dict(item.split("=", 1) for item in sig_header.split(",") if "=" in item)
    timestamp = parts.get("t")
    signature = parts.get("v1")
    if not timestamp or not signature:
        return False
    signed_payload = f"{timestamp}.".encode("utf-8") + payload_body
    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    """Handle Stripe subscription lifecycle webhooks with HMAC signature verification."""
    body = await request.body()
    if settings.STRIPE_WEBHOOK_SECRET:
        if not verify_stripe_signature(body, stripe_signature or "", settings.STRIPE_WEBHOOK_SECRET):
            raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

    try:
        event = json.loads(body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type", "")
    obj = event.get("data", {}).get("object", {})
    workspace_id = obj.get("client_reference_id") or obj.get("metadata", {}).get("workspace_id")

    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if ws:
            if event_type == "checkout.session.completed":
                ws.plan = obj.get("metadata", {}).get("plan", "pro")
                db.commit()
            elif event_type == "customer.subscription.deleted":
                ws.plan = "starter"
                db.commit()

    return {"received": True, "event_type": event_type}
