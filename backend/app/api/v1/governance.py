from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.governance import AuditLog, RetentionPolicy
from app.models.auth import User
from app.core.rbac import get_current_user, require_roles
from app.schemas.domain import AuditLogOut, RetentionPolicyOut, UserOut

router = APIRouter(tags=["Governance, Audit & Access Control"])

@router.get("/audit", response_model=List[AuditLogOut])
def list_audit_logs(
    case_id: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Auditor", "Investigator"]))
):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if case_id:
        query = query.filter_by(case_id=case_id)
    if action:
        query = query.filter_by(action=action)
    if user_id:
        query = query.filter_by(user_id=user_id)
    return query.limit(limit).all()

@router.get("/governance/policies", response_model=List[RetentionPolicyOut])
def list_retention_policies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(RetentionPolicy).all()

@router.get("/governance/users", response_model=List[UserOut])
def list_system_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Auditor"]))
):
    return db.query(User).all()
