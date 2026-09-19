import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class AIFinding(Base):
    __tablename__ = "ai_findings"
    
    id = Column(String, primary_key=True, index=True) # e.g. FIND-901
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    finding_type = Column(String, index=True, nullable=False) # Potential Relationship, Entity Resolution Candidate, Hidden Broker, Shell Front
    title = Column(String, nullable=False)
    
    # Entities involved
    source_entity_id = Column(String, ForeignKey("entities.id"), nullable=False)
    target_entity_id = Column(String, ForeignKey("entities.id"), nullable=False)
    
    confidence = Column(Float, nullable=False) # e.g. 0.82
    status = Column(String, default="UNVERIFIED", index=True) # UNVERIFIED, VERIFIED, REJECTED, NEED_MORE_EVIDENCE
    
    # Traceability & Explainability
    model_name = Column(String, default="Link Prediction Engine")
    model_version = Column(String, default="v2.4")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Supporting Signals (e.g. Network Structure: 31%, Temporal: 24%, Communication: 18%, Financial: 16%, Location: 11%)
    supporting_signals = Column(JSON, default=dict)
    
    # Evidence & Provenance references
    evidence_ids = Column(JSON, default=list)
    explanation_text = Column(Text, nullable=False)
    provenance_path = Column(JSON, default=list) # Full step trace: Source -> Record -> Entity -> Finding

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(String, primary_key=True, index=True) # e.g. ANOM-301
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    anomaly_type = Column(String, index=True, nullable=False) # Communication Surge, Rapid Financial Cycling, Coordinate Co-Presence, Structural Outlier
    title = Column(String, nullable=False)
    
    entity_ids = Column(JSON, default=list)
    confidence = Column(Float, default=0.88)
    severity = Column(String, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String, default="UNVERIFIED") # UNVERIFIED, INVESTIGATING, DISMISSED, CONFIRMED
    
    detection_time = Column(DateTime, default=datetime.datetime.utcnow)
    model_name = Column(String, default="Graph Centrality & Volume Isolation Forest")
    model_version = Column(String, default="v1.8")
    
    signals = Column(JSON, default=dict) # Quantitative anomalies (e.g. z_score, spike_factor, isolation_score)
    evidence_ids = Column(JSON, default=list)
    description = Column(Text, nullable=False)

class CrossCaseLink(Base):
    __tablename__ = "cross_case_links"
    
    id = Column(String, primary_key=True, index=True) # e.g. XLINK-201
    source_case_id = Column(String, nullable=False) # e.g. CASE-0147
    target_case_id = Column(String, nullable=False) # e.g. CASE-0192
    
    shared_entity_id = Column(String, ForeignKey("entities.id"), nullable=False)
    link_type = Column(String, nullable=False) # Shared Vehicle, Shared Burner Phone, Shared Shell Account, Shared Geolocation
    
    confidence = Column(Float, default=0.95)
    status = Column(String, default="REQUIRES_REVIEW") # REQUIRES_REVIEW, CONFIRMED, REFUTED
    
    supporting_evidence_ids = Column(JSON, default=list)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
