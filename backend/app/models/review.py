import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class ReviewAction(Base):
    __tablename__ = "review_actions"
    
    id = Column(String, primary_key=True, index=True) # e.g. REV-401
    ai_finding_id = Column(String, ForeignKey("ai_findings.id"), index=True, nullable=False)
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    
    reviewer_user_id = Column(String, nullable=False)
    reviewer_name = Column(String, nullable=False)
    reviewer_role = Column(String, nullable=False)
    
    action = Column(String, nullable=False) # VERIFIED, REJECTED, NEED_MORE_EVIDENCE
    reason_code = Column(String, nullable=False) # CONFIRMED_BY_CORROBORATING_WIRE, NO_SUBSTANTIATING_CDR, INSUFFICIENT_PROBATIVE_VALUE, etc.
    investigator_notes = Column(Text, nullable=False)
    
    previous_status = Column(String, default="UNVERIFIED")
    new_status = Column(String, nullable=False)
    
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)

class Finding(Base):
    """
    Official Human-Verified Finding (Decision-Support Outcome).
    Only created or promoted after affirmative human investigator verification.
    """
    __tablename__ = "findings"
    
    id = Column(String, primary_key=True, index=True) # e.g. VER-FND-101
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    ai_finding_id = Column(String, ForeignKey("ai_findings.id"), nullable=True) # Provenance reference
    
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    finding_type = Column(String, nullable=False) # Established Criminal Relationship, Controlled Asset, Laundering Conduit
    
    verified_by = Column(String, nullable=False)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    confidence_level = Column(String, default="PROBABLE_CAUSE") # BEYOND_REASONABLE_DOUBT, PROBABLE_CAUSE, REASONABLE_SUSPICION
    
    supporting_entities = Column(JSON, default=list)
    supporting_evidence = Column(JSON, default=list)
    court_ready = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
