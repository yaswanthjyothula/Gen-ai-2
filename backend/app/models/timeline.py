import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(String, primary_key=True, index=True) # e.g. EVT-701
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    
    event_type = Column(String, index=True, nullable=False) # Communication, Transaction, Location, Vehicle, Evidence, Relationship, Case Event, AI Detection, Review Action
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    
    primary_entity_id = Column(String, nullable=True)
    secondary_entity_id = Column(String, nullable=True)
    
    evidence_id = Column(String, nullable=True)
    source_record_id = Column(String, nullable=True)
    
    significance = Column(String, default="HIGH") # CRITICAL, HIGH, MEDIUM, ROUTINE
    metadata_json = Column(JSON, default=dict) # Details: lat/long, amounts, durations, call directions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
