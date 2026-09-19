import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True) # e.g. AUD-9042
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    user_id = Column(String, index=True, nullable=False)
    username = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    
    action = Column(String, index=True, nullable=False) # LOGIN, CASE_ACCESS, EVIDENCE_ACCESS, ENTITY_ACCESS, AI_FINDING_ACCESS, REVIEW_DECISION, REPORT_GENERATION, CONFIG_CHANGE
    case_id = Column(String, index=True, nullable=True)
    target_object_id = Column(String, index=True, nullable=True) # Entity ID, Evidence ID, Finding ID
    
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    reason = Column(String, nullable=False)
    
    ip_address = Column(String, default="127.0.0.1")
    user_agent = Column(String, default="CRIMENET-X Investigator Console")

class RetentionPolicy(Base):
    __tablename__ = "retention_policies"
    
    id = Column(String, primary_key=True, index=True)
    data_classification = Column(String, nullable=False) # STRICT_EVIDENCE, RAW_CDR, DERIVED_GRAPH, AI_CANDIDATE
    retention_period_days = Column(Integer, nullable=False) # e.g. 2555 (7 years)
    auto_archive = Column(Boolean, default=True)
    deletion_schedule = Column(String, default="QUARTERLY_LEGAL_PURGE")
    legal_statute = Column(String, default="Criminal Procedure Code Title 18 Sec 2518")
    status = Column(String, default="ACTIVE")
