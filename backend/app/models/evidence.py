import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class SourceRecord(Base):
    __tablename__ = "source_records"
    
    id = Column(String, primary_key=True, index=True) # e.g. SRC-REC-1001
    source_name = Column(String, index=True, nullable=False) # e.g. "FinCEN SAR Feed", "MetTel CDR Archive", "Port Authority Gate 4"
    source_type = Column(String, nullable=False) # Telephony, Banking, Surveillance, DMV, Customs
    raw_content = Column(Text, nullable=False)
    ingestion_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    checksum_sha256 = Column(String, nullable=False)
    status = Column(String, default="PROCESSED") # RAW, PROCESSED, ERROR, QUARANTINED
    metadata_json = Column(JSON, default=dict)

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String, primary_key=True, index=True) # e.g. EVID-801
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    source_record_id = Column(String, ForeignKey("source_records.id"), nullable=True)
    
    title = Column(String, nullable=False)
    evidence_type = Column(String, index=True, nullable=False) # Financial Record, CDR Call Detail, DMV Registry, Warrant Audio, Surveillance Photo
    description = Column(Text, nullable=True)
    classification = Column(String, default="RESTRICTED")
    
    chain_of_custody = Column(JSON, default=list) # List of handling officers and timestamps
    checksum_sha256 = Column(String, nullable=False)
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)
    collected_by = Column(String, default="Det. Inspector Sarah Vance")
    
    associated_entities = Column(JSON, default=list) # List of Entity IDs
    associated_relationships = Column(JSON, default=list) # List of Relationship IDs
    
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
