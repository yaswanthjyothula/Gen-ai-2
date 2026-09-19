from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.timeline import TimelineEvent
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import TimelineEventOut

router = APIRouter(prefix="/timeline", tags=["Timeline Intelligence"])

@router.get("", response_model=List[TimelineEventOut])
def get_investigation_timeline(
    case_id: Optional[str] = None,
    event_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    significance: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TimelineEvent).order_by(TimelineEvent.timestamp.desc())
    if case_id:
        query = query.filter_by(case_id=case_id)
    if event_type:
        query = query.filter_by(event_type=event_type)
    if entity_id:
        query = query.filter(
            (TimelineEvent.primary_entity_id == entity_id) | (TimelineEvent.secondary_entity_id == entity_id)
        )
    if significance:
        query = query.filter_by(significance=significance)
    if date_from:
        query = query.filter(TimelineEvent.timestamp >= date_from)
    if date_to:
        query = query.filter(TimelineEvent.timestamp <= date_to)
    return query.all()
