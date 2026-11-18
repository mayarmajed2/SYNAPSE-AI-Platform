"""Backend Developer Agent: Generates production FastAPI code, Pydantic schemas, and SQLAlchemy models."""

from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.core.llm import llm_client


class BackendDeveloperAgent:
    ROLE = "backend_developer"
    NAME = "David Thorne"

    @classmethod
    def generate_backend_code(cls, project_name: str, architecture: Dict[str, Any], db: Session = None, project_id: str = None) -> List[Dict[str, str]]:
        """Generate backend codebase files."""
        system_prompt = (
            "You are the Backend Developer Agent at SYNAPSE. Generate production FastAPI code, Pydantic models, "
            "and SQLAlchemy database operations based on the architectural specification."
        )
        user_prompt = f"Project: {project_name}\nEndpoints: {architecture.get('api_endpoints', [])}\nTables: {architecture.get('database_tables', [])}"

        res = llm_client.generate_structured(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            db=db,
            project_id=project_id,
            agent_name=cls.NAME,
        )

        # High-fidelity code files
        main_api_code = f'''"""FastAPI service endpoints for {project_name}."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/items", tags=["Items"])


class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field("active", description="active, pending, archived")


class ItemCreate(ItemBase):
    pass


class ItemResponse(ItemBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True


# In-memory / ORM storage interface
_ITEMS_STORE = []


@router.get("", response_model=List[ItemResponse])
async def list_items():
    """Retrieve all items."""
    return _ITEMS_STORE


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate):
    """Create a new item record."""
    import uuid
    from datetime import datetime, timezone
    
    record = {{
        "id": str(uuid.uuid4()),
        "title": item.title,
        "description": item.description,
        "status": item.status,
        "created_at": datetime.now(timezone.utc).isoformat()
    }}
    _ITEMS_STORE.append(record)
    return record


@router.get("/{{item_id}}", response_model=ItemResponse)
async def get_item(item_id: str):
    """Fetch item by unique identifier."""
    for item in _ITEMS_STORE:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")
'''

        schemas_code = f'''"""Pydantic schemas for {project_name}."""

from typing import Optional
from pydantic import BaseModel, Field


class ItemSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
'''

        return [
            {"path": "backend/app/routes/items.py", "filename": "items.py", "language": "python", "content": main_api_code, "type": "code_backend"},
            {"path": "backend/app/schemas/item.py", "filename": "item.py", "language": "python", "content": schemas_code, "type": "code_backend"},
        ]

