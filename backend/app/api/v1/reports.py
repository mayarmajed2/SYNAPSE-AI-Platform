"""Engineering Delivery Reports API Router."""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Engineering Delivery Reports"])


@router.get("/project/{project_id}")
def get_delivery_report(project_id: str, db: Session = Depends(get_db)):
    """Retrieve structured 18-section engineering delivery report."""
    try:
        return ReportService.generate_delivery_report(db, project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/project/{project_id}/markdown")
def download_report_markdown(project_id: str, db: Session = Depends(get_db)):
    """Download delivery report as standard GitHub-flavored Markdown."""
    try:
        report = ReportService.generate_delivery_report(db, project_id)
        filename = f"{report['project_name'].lower().replace(' ', '_')}_delivery_report.md"
        return Response(
            content=report["markdown"],
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

