import datetime
import uuid
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.governance import AuditLog
from app.models.auth import User

def record_audit_event(
    db: Session,
    user: User,
    action: str,
    reason: str,
    case_id: Optional[str] = None,
    target_object_id: Optional[str] = None,
    previous_state: Optional[Any] = None,
    new_state: Optional[Any] = None,
    ip_address: str = "127.0.0.1",
    user_agent: str = "CRIMENET-X Web Console"
) -> AuditLog:
    log_entry = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        timestamp=datetime.datetime.utcnow(),
        user_id=user.id,
        username=user.username,
        user_role=user.role,
        action=action,
        case_id=case_id,
        target_object_id=target_object_id,
        previous_state=previous_state,
        new_state=new_state,
        reason=reason,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
