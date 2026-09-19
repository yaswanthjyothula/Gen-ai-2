from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.investigation import Investigation, Case
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import InvestigationOut, CaseOut
from app.services.audit_service import record_audit_event

router = APIRouter(tags=["Investigations & Cases"])

@router.get("/investigations", response_model=List[InvestigationOut])
def list_investigations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Investigation).all()

@router.get("/investigations/{investigation_id}", response_model=InvestigationOut)
def get_investigation(
    investigation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter_by(id=investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    record_audit_event(
        db=db,
        user=current_user,
        action="CASE_ACCESS",
        case_id=investigation_id,
        reason=f"Accessed investigation {investigation_id}"
    )
    return inv

@router.get("/cases", response_model=List[CaseOut])
def list_cases(
    investigation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Case)
    if investigation_id:
        query = query.filter_by(investigation_id=investigation_id)
    return query.all()

@router.get("/cases/{case_id}", response_model=CaseOut)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter_by(id=case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    record_audit_event(
        db=db,
        user=current_user,
        action="CASE_ACCESS",
        case_id=case_id,
        reason=f"Opened case file {case_id}"
    )
    return case
