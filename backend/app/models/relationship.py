import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class Relationship(Base):
    __tablename__ = "relationships"
    
    id = Column(String, primary_key=True, index=True) # e.g. REL-501
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    source_entity_id = Column(String, ForeignKey("entities.id"), index=True, nullable=False)
    target_entity_id = Column(String, ForeignKey("entities.id"), index=True, nullable=False)
    
    relationship_type = Column(String, index=True, nullable=False) # Communication, Financial, Location, Ownership, Association, Vehicle, Organisation, Case
    label = Column(String, nullable=False) # e.g. "Transferred $45,000", "Co-located at Pier 42", "Director of"
    
    confidence = Column(Float, default=1.0) # 0.0 to 1.0
    weight = Column(Float, default=1.0) # Edge weight
    
    verification_status = Column(String, default="VERIFIED") # VERIFIED, AI_UNVERIFIED, REJECTED, PENDING_REVIEW
    evidence_id = Column(String, nullable=True)
    source = Column(String, default="Authorized Intercept")
    
    # Temporal Intelligence
    first_seen = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    frequency = Column(Integer, default=1)
    
    attributes = Column(JSON, default=dict) # Details: transaction amounts, call durations, coordinates, vehicle plates
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
