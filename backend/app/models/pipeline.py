import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(String, primary_key=True, index=True) # e.g. SRC-01
    name = Column(String, nullable=False) # e.g. "Telephony Call Detail Records (CDR)"
    source_type = Column(String, nullable=False) # Case Records, Communication Data, Transaction Data, Location Data, Vehicle Data, Digital Evidence
    jurisdiction = Column(String, default="Federal Court Warrant #2026-W-89")
    records_count = Column(Integer, default=0)
    entities_created = Column(Integer, default=0)
    relationships_created = Column(Integer, default=0)
    status = Column(String, default="ACTIVE") # ACTIVE, INGESTING, FAILED, OFFLINE
    last_sync = Column(DateTime, default=datetime.datetime.utcnow)

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    
    id = Column(String, primary_key=True, index=True) # e.g. RUN-2026-0912
    pipeline_name = Column(String, default="Standard Investigative ETL & Graph Pipeline")
    status = Column(String, default="SUCCESS") # RUNNING, SUCCESS, FAILED, WARNING
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    stages_completed = Column(JSON, default=list) 
    # Stages: Raw Data -> Validation -> Cleaning -> Normalisation -> Entity Resolution -> Relationship Extraction -> Graph Construction
    
    records_processed = Column(Integer, default=0)
    entities_resolved = Column(Integer, default=0)
    relationships_inferred = Column(Integer, default=0)
    anomalies_detected = Column(Integer, default=0)
    execution_time_seconds = Column(Float, default=14.2)
    logs = Column(Text, nullable=True)

class EntityResolutionCandidate(Base):
    __tablename__ = "entity_resolution_candidates"
    
    id = Column(String, primary_key=True, index=True) # e.g. ER-501
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    
    record_a_id = Column(String, nullable=False)
    record_b_id = Column(String, nullable=False)
    record_a_name = Column(String, nullable=False)
    record_b_name = Column(String, nullable=False)
    
    match_confidence = Column(Float, nullable=False) # e.g. 0.89
    matching_signals = Column(JSON, default=dict) # e.g. {"phone_overlap": 0.95, "dob_match": 1.0, "name_levenshtein": 0.84, "address_fuzzy": 0.78}
    
    status = Column(String, default="PENDING_REVIEW") # PENDING_REVIEW, MERGED, REJECTED
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

class AIModelRegistry(Base):
    __tablename__ = "ai_models"
    
    id = Column(String, primary_key=True, index=True) # e.g. MOD-LP-01
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False) # Link Prediction, Anomaly Detection, Entity Resolution, Community Detection, NLP Relation Extraction
    version = Column(String, nullable=False)
    status = Column(String, default="DEPLOYED") # DEPLOYED, CANDIDATE, RETIRED
    
    dataset_name = Column(String, default="CERBERUS-BENCH-2026")
    training_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    metrics = Column(JSON, default=dict) # e.g. {"precision": 0.88, "recall": 0.84, "f1": 0.86, "pr_auc": 0.91, "modularity": 0.78}
    parameters = Column(JSON, default=dict)
