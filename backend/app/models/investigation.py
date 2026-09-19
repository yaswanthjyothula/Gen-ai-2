import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class Investigation(Base):
    __tablename__ = "investigations"
    
    id = Column(String, primary_key=True, index=True) # e.g. INV-2026-0147
    title = Column(String, nullable=False)
    code_name = Column(String, default="CERBERUS")
    description = Column(Text, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, PENDING_REVIEW, CLOSED, ARCHIVED
    lead_investigator_id = Column(String, nullable=True)
    classification = Column(String, default="SECRET//LAW ENFORCEMENT SENSITIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    metadata_json = Column(JSON, default=dict)

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, index=True) # e.g. CASE-0147
    investigation_id = Column(String, ForeignKey("investigations.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    priority = Column(String, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    case_type = Column(String, default="Organised Crime & Illicit Finance")
    lead_officer = Column(String, default="Det. Inspector Sarah Vance")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    entity_count = Column(Integer, default=0)
    relationship_count = Column(Integer, default=0)
    evidence_count = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
