from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entity import Entity, EntityAlias, Community
from app.models.relationship import Relationship
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import EntityOut, CommunityOut, RelationshipOut
from app.services.audit_service import record_audit_event

router = APIRouter(tags=["Entities & Communities"])

@router.get("/entities", response_model=List[EntityOut])
def list_entities(
    case_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    community_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Entity)
    if case_id:
        query = query.filter_by(case_id=case_id)
    if entity_type:
        query = query.filter_by(entity_type=entity_type)
    if risk_level:
        query = query.filter_by(risk_level=risk_level)
    if community_id:
        query = query.filter_by(community_id=community_id)
    if search:
        query = query.filter(Entity.name.ilike(f"%{search}%"))
    return query.all()

@router.get("/entities/{entity_id}")
def get_entity_profile(
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ent = db.query(Entity).filter_by(id=entity_id).first()
    if not ent:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    aliases = db.query(EntityAlias).filter_by(entity_id=entity_id).all()
    relationships = db.query(Relationship).filter(
        (Relationship.source_entity_id == entity_id) | (Relationship.target_entity_id == entity_id)
    ).all()
    
    record_audit_event(
        db=db,
        user=current_user,
        action="ENTITY_ACCESS",
        case_id=ent.case_id,
        target_object_id=ent.id,
        reason=f"Inspected entity profile: {ent.name}"
    )
    
    return {
        "entity": ent,
        "aliases": [a.alias for a in aliases],
        "relationships": relationships,
        "relationship_count": len(relationships),
        "community": db.query(Community).filter_by(id=ent.community_id).first() if ent.community_id else None
    }

@router.get("/communities", response_model=List[CommunityOut])
def list_communities(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Community)
    if case_id:
        query = query.filter_by(case_id=case_id)
    return query.all()
