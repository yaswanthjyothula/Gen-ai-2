from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import InvestigationReport
from app.models.auth import User
from app.core.rbac import get_current_user, require_roles
from app.schemas.domain import InvestigationReportOut, ReportGenerateRequest
from app.services.report_service import generate_investigation_report
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/reports", tags=["Reporting & Dossiers"])

@router.get("", response_model=List[InvestigationReportOut])
def list_reports(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InvestigationReport).order_by(InvestigationReport.generated_at.desc())
    if case_id:
        query = query.filter_by(case_id=case_id)
    return query.all()

@router.get("/{report_id}", response_model=InvestigationReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(InvestigationReport).filter_by(id=report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    record_audit_event(
        db=db,
        user=current_user,
        action="REPORT_GENERATION",
        case_id=report.case_id,
        target_object_id=report.id,
        reason=f"Investigator accessed report dossier {report_id}"
    )
    return report

@router.post("/generate", response_model=InvestigationReportOut)
def create_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Investigator", "Analyst"]))
):
    report = generate_investigation_report(
        db=db,
        case_id=req.case_id,
        title=req.title,
        user_name=f"{current_user.full_name} ({current_user.role})",
        classification=req.classification
    )
    record_audit_event(
        db=db,
        user=current_user,
        action="REPORT_GENERATION",
        case_id=req.case_id,
        target_object_id=report.id,
        reason=f"Generated formal intelligence dossier: {report.title}"
    )
    return report
