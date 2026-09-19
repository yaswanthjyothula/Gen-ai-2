from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.relationship import Relationship
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import RelationshipOut

router = APIRouter(prefix="/relationships", tags=["Relationships"])

@router.get("", response_model=List[RelationshipOut])
def list_relationships(
    case_id: Optional[str] = None,
    relationship_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    min_confidence: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Relationship)
    if case_id:
        query = query.filter_by(case_id=case_id)
    if relationship_type:
        query = query.filter_by(relationship_type=relationship_type)
    if verification_status:
        query = query.filter_by(verification_status=verification_status)
    if min_confidence is not None:
        query = query.filter(Relationship.confidence >= min_confidence)
    return query.all()

@router.get("/{relationship_id}", response_model=RelationshipOut)
def get_relationship(
    relationship_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rel = db.query(Relationship).filter_by(id=relationship_id).first()
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return rel
