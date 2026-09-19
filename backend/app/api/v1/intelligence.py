from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.ai_finding import AIFinding, Anomaly, CrossCaseLink
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import AIFindingOut, AnomalyOut, CrossCaseLinkOut
from app.services.audit_service import record_audit_event

router = APIRouter(tags=["AI Intelligence & Anomalies"])

@router.get("/intelligence/findings", response_model=List[AIFindingOut])
def list_ai_findings(
    case_id: Optional[str] = None,
    status: Optional[str] = None,
    min_confidence: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AIFinding)
    if case_id:
        query = query.filter_by(case_id=case_id)
    if status:
        query = query.filter_by(status=status)
    if min_confidence is not None:
        query = query.filter(AIFinding.confidence >= min_confidence)
    return query.all()

@router.get("/intelligence/findings/{finding_id}", response_model=AIFindingOut)
def get_ai_finding(
    finding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(AIFinding).filter_by(id=finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="AI Finding not found")
        
    record_audit_event(
        db=db,
        user=current_user,
        action="AI_FINDING_ACCESS",
        case_id=finding.case_id,
        target_object_id=finding.id,
        reason=f"Investigated AI Finding: {finding.title}"
    )
    return finding

@router.get("/anomalies", response_model=List[AnomalyOut])
def list_anomalies(
    case_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Anomaly)
    if case_id:
        query = query.filter_by(case_id=case_id)
    if severity:
        query = query.filter_by(severity=severity)
    if status:
        query = query.filter_by(status=status)
    return query.all()

@router.get("/anomalies/{anomaly_id}", response_model=AnomalyOut)
def get_anomaly(
    anomaly_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    anomaly = db.query(Anomaly).filter_by(id=anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return anomaly

@router.get("/cross-case", response_model=List[CrossCaseLinkOut])
def list_cross_case_links(
    source_case_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CrossCaseLink)
    if source_case_id:
        query = query.filter(
            (CrossCaseLink.source_case_id == source_case_id) | (CrossCaseLink.target_case_id == source_case_id)
        )
    if status:
        query = query.filter_by(status=status)
    return query.all()
