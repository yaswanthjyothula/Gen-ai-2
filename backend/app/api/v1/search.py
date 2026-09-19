from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Case, Entity, Relationship, Evidence, AIFinding, Community, TimelineEvent
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import SearchResponse, SearchItem

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=1, description="Global search keyword"),
    case_id: str = Query("CASE-0147"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = []
    query_str = q.lower()
    
    # 1. Search Entities
    entities = db.query(Entity).filter(
        (Entity.case_id == case_id) & 
        ((Entity.name.ilike(f"%{q}%")) | (Entity.entity_type.ilike(f"%{q}%")) | (Entity.category.ilike(f"%{q}%")))
    ).limit(8).all()
    for e in entities:
        results.append(SearchItem(
            id=e.id,
            category="Entity",
            title=e.name,
            subtitle=f"{e.entity_type} • Risk: {e.risk_level}",
            route=f"/investigation/entities/{e.id}",
            confidence=e.confidence,
            status=e.status
        ))
        
    # 2. Search Cases
    cases = db.query(Case).filter(
        (Case.title.ilike(f"%{q}%")) | (Case.id.ilike(f"%{q}%")) | (Case.case_type.ilike(f"%{q}%"))
    ).limit(3).all()
    for c in cases:
        results.append(SearchItem(
            id=c.id,
            category="Case",
            title=f"{c.id}: {c.title}",
            subtitle=f"{c.case_type} • Priority: {c.priority}",
            route=f"/investigation/cases/{c.id}",
            status=c.status
        ))
        
    # 3. Search AI Findings
    findings = db.query(AIFinding).filter(
        (AIFinding.case_id == case_id) &
        ((AIFinding.title.ilike(f"%{q}%")) | (AIFinding.finding_type.ilike(f"%{q}%")) | (AIFinding.explanation_text.ilike(f"%{q}%")))
    ).limit(5).all()
    for f in findings:
        results.append(SearchItem(
            id=f.id,
            category="AI Finding",
            title=f.title,
            subtitle=f"{f.finding_type} • Model: {f.model_name}",
            route="/intelligence/workspace",
            confidence=f.confidence,
            status=f.status
        ))
        
    # 4. Search Evidence
    evidences = db.query(Evidence).filter(
        (Evidence.case_id == case_id) &
        ((Evidence.title.ilike(f"%{q}%")) | (Evidence.evidence_type.ilike(f"%{q}%")) | (Evidence.description.ilike(f"%{q}%")))
    ).limit(5).all()
    for ev in evidences:
        results.append(SearchItem(
            id=ev.id,
            category="Evidence",
            title=ev.title,
            subtitle=f"{ev.evidence_type} • Hash: {ev.checksum_sha256[:12]}...",
            route="/evidence",
            status="VERIFIED" if ev.is_verified else "PENDING"
        ))
        
    # 5. Search Communities
    comms = db.query(Community).filter(
        (Community.case_id == case_id) &
        ((Community.name.ilike(f"%{q}%")) | (Community.community_type.ilike(f"%{q}%")))
    ).limit(3).all()
    for cm in comms:
        results.append(SearchItem(
            id=cm.id,
            category="Community",
            title=cm.name,
            subtitle=f"{cm.community_type} • Size: {cm.size} nodes",
            route="/investigation/communities"
        ))

    return {
        "query": q,
        "total_results": len(results),
        "results": results
    }
