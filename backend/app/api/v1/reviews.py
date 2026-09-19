import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.ai_finding import AIFinding
from app.models.review import ReviewAction, Finding
from app.models.relationship import Relationship
from app.models.auth import User
from app.core.rbac import get_current_user, require_roles
from app.schemas.domain import LeadReviewRequest, ReviewActionOut, FindingOut, AIFindingOut
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/reviews", tags=["Human Review Queue"])

@router.get("/queue", response_model=List[AIFindingOut])
def get_review_queue(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all pending AI leads requiring human verification."""
    query = db.query(AIFinding).filter_by(status="UNVERIFIED")
    if case_id:
        query = query.filter_by(case_id=case_id)
    return query.all()

@router.post("/findings/{finding_id}", response_model=ReviewActionOut)
def review_ai_lead(
    finding_id: str,
    req: LeadReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Investigator", "Reviewer"]))
):
    """Submit human review decision: VERIFIED, REJECTED, or NEED_MORE_EVIDENCE."""
    ai_finding = db.query(AIFinding).filter_by(id=finding_id).first()
    if not ai_finding:
        raise HTTPException(status_code=404, detail="AI Finding not found")
        
    prev_status = ai_finding.status
    ai_finding.status = req.action
    
    # Record review action
    review_action = ReviewAction(
        id=f"REV-{uuid.uuid4().hex[:6].upper()}",
        ai_finding_id=ai_finding.id,
        case_id=ai_finding.case_id,
        reviewer_user_id=current_user.id,
        reviewer_name=current_user.full_name,
        reviewer_role=current_user.role,
        action=req.action,
        reason_code=req.reason_code,
        investigator_notes=req.investigator_notes,
        previous_status=prev_status,
        new_status=req.action,
        reviewed_at=datetime.datetime.utcnow()
    )
    db.add(review_action)
    
    # If verified, promote to official verified Finding and update relationship if applicable
    if req.action == "VERIFIED":
        official_finding = Finding(
            id=f"VER-FND-{uuid.uuid4().hex[:6].upper()}",
            case_id=ai_finding.case_id,
            ai_finding_id=ai_finding.id,
            title=f"Verified: {ai_finding.title}",
            summary=f"Human investigator {current_user.full_name} confirmed lead: {req.investigator_notes}",
            finding_type=ai_finding.finding_type,
            verified_by=f"{current_user.full_name} ({current_user.role})",
            verified_at=datetime.datetime.utcnow(),
            confidence_level="PROBABLE_CAUSE",
            supporting_entities=[ai_finding.source_entity_id, ai_finding.target_entity_id],
            supporting_evidence=ai_finding.evidence_ids or [],
            court_ready=True
        )
        db.add(official_finding)
        
        # Check if there is an unverified relationship to update
        rel = db.query(Relationship).filter(
            ((Relationship.source_entity_id == ai_finding.source_entity_id) & (Relationship.target_entity_id == ai_finding.target_entity_id)) |
            ((Relationship.source_entity_id == ai_finding.target_entity_id) & (Relationship.target_entity_id == ai_finding.source_entity_id))
        ).first()
        if rel and rel.verification_status == "AI_UNVERIFIED":
            rel.verification_status = "VERIFIED"
            
    # Record immutable audit log
    record_audit_event(
        db=db,
        user=current_user,
        action="REVIEW_DECISION",
        case_id=ai_finding.case_id,
        target_object_id=ai_finding.id,
        previous_state={"status": prev_status},
        new_state={"status": req.action, "reason_code": req.reason_code},
        reason=f"Human review completed for {ai_finding.id}: {req.action} ({req.reason_code})"
    )
    
    db.commit()
    db.refresh(review_action)
    return review_action

@router.get("/history", response_model=List[ReviewActionOut])
def list_review_history(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ReviewAction).order_by(ReviewAction.reviewed_at.desc())
    if case_id:
        query = query.filter_by(case_id=case_id)
    return query.all()
