import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class InvestigationReport(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, index=True) # e.g. REP-2026-001
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    classification = Column(String, default="SECRET//LAW ENFORCEMENT SENSITIVE")
    
    generated_by = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    checksum_sha256 = Column(String, nullable=False)
    
    # Report Section Content
    summary = Column(Text, nullable=False)
    data_sources_summary = Column(JSON, default=dict)
    entities_summary = Column(JSON, default=dict)
    network_metrics = Column(JSON, default=dict)
    communities_analysis = Column(JSON, default=dict)
    timeline_chronology = Column(JSON, default=list)
    ai_leads_evaluation = Column(JSON, default=dict)
    evidence_provenance_chain = Column(JSON, default=list)
    human_verification_log = Column(JSON, default=list)
    governance_audit_summary = Column(JSON, default=dict)
    
    status = Column(String, default="FINAL") # DRAFT, FINAL, ARCHIVED
