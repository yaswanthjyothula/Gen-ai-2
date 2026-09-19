import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey, Text
from app.db.session import Base

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(String, primary_key=True, index=True) # e.g. ENT-101
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    entity_type = Column(String, index=True, nullable=False) # Person, Account, Phone, Vehicle, Location, Organisation, Device, Case
    category = Column(String, default="Primary Target") # Primary Target, Associate, Facilitator, Asset, Infrastructure
    confidence = Column(Float, default=1.0) # 0.0 to 1.0
    risk_level = Column(String, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    is_verified = Column(Boolean, default=True) # Verified vs AI Candidate
    status = Column(String, default="ACTIVE")
    
    # Graph Centrality Metrics Cache
    degree_centrality = Column(Float, default=0.0)
    betweenness_centrality = Column(Float, default=0.0)
    closeness_centrality = Column(Float, default=0.0)
    community_id = Column(String, index=True, nullable=True)
    
    # Metadata & Detailed attributes
    attributes = Column(JSON, default=dict) # e.g. DOB, National ID, Registration, IMEI, IBAN, Coordinates
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class EntityAlias(Base):
    __tablename__ = "entity_aliases"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, ForeignKey("entities.id"), index=True, nullable=False)
    alias = Column(String, index=True, nullable=False)
    source = Column(String, default="HUMINT / Intercept")
    confidence = Column(Float, default=0.9)

class Community(Base):
    __tablename__ = "communities"
    
    id = Column(String, primary_key=True, index=True) # e.g. COMM-01
    case_id = Column(String, ForeignKey("cases.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    size = Column(Integer, default=0)
    density = Column(Float, default=0.0)
    primary_entity_id = Column(String, nullable=True) # Central node in cluster
    community_type = Column(String, default="Distribution Cell") # Financial Laundering, Logistics, Operational Command
    modularity_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
