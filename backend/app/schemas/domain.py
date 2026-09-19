from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Auth ---
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    role: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    badge_number: Optional[str] = None
    department: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Investigation & Case ---
class InvestigationOut(BaseModel):
    id: str
    title: str
    code_name: str
    description: Optional[str] = None
    status: str
    lead_investigator_id: Optional[str] = None
    classification: str
    created_at: datetime
    metadata_json: Dict[str, Any] = {}
    class Config:
        from_attributes = True

class CaseOut(BaseModel):
    id: str
    investigation_id: str
    title: str
    status: str
    priority: str
    case_type: str
    lead_officer: str
    description: Optional[str] = None
    created_at: datetime
    entity_count: int
    relationship_count: int
    evidence_count: int
    findings_count: int
    class Config:
        from_attributes = True

# --- Entities & Communities ---
class EntityOut(BaseModel):
    id: str
    case_id: str
    name: str
    entity_type: str
    category: str
    confidence: float
    risk_level: str
    is_verified: bool
    status: str
    degree_centrality: float = 0.0
    betweenness_centrality: float = 0.0
    closeness_centrality: float = 0.0
    community_id: Optional[str] = None
    attributes: Dict[str, Any] = {}
    created_at: datetime
    class Config:
        from_attributes = True

class CommunityOut(BaseModel):
    id: str
    case_id: str
    name: str
    description: Optional[str] = None
    size: int
    density: float
    primary_entity_id: Optional[str] = None
    community_type: str
    modularity_score: float
    created_at: datetime
    class Config:
        from_attributes = True

# --- Relationships ---
class RelationshipOut(BaseModel):
    id: str
    case_id: str
    source_entity_id: str
    target_entity_id: str
    relationship_type: str
    label: str
    confidence: float
    weight: float
    verification_status: str
    evidence_id: Optional[str] = None
    source: str
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    frequency: int
    attributes: Dict[str, Any] = {}
    class Config:
        from_attributes = True

# --- Network ---
class CytoscapeNodeData(BaseModel):
    id: str
    label: str
    name: str
    entity_type: str
    category: str
    confidence: float
    risk_level: str
    community_id: Optional[str] = None
    degree_centrality: float = 0.0
    betweenness_centrality: float = 0.0
    attributes: Dict[str, Any] = {}

class CytoscapeEdgeData(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship_type: str
    weight: float
    confidence: float
    verification_status: str
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    frequency: int
    attributes: Dict[str, Any] = {}

class CytoscapeElement(BaseModel):
    data: Dict[str, Any]

class NetworkGraphResponse(BaseModel):
    nodes: List[CytoscapeElement]
    edges: List[CytoscapeElement]
    statistics: Dict[str, Any]

class ShortestPathRequest(BaseModel):
    source_entity_id: str
    target_entity_id: str

class ShortestPathResponse(BaseModel):
    source: str
    target: str
    path: Optional[List[str]] = None
    length: int = 0
    intermediaries: List[str] = []

# --- Evidence & Provenance ---
class EvidenceOut(BaseModel):
    id: str
    case_id: str
    source_record_id: Optional[str] = None
    title: str
    evidence_type: str
    description: Optional[str] = None
    classification: str
    chain_of_custody: List[Dict[str, Any]] = []
    checksum_sha256: str
    collected_at: datetime
    collected_by: str
    associated_entities: List[str] = []
    associated_relationships: List[str] = []
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SourceRecordOut(BaseModel):
    id: str
    source_name: str
    source_type: str
    raw_content: str
    ingestion_timestamp: datetime
    checksum_sha256: str
    status: str
    metadata_json: Dict[str, Any] = {}
    class Config:
        from_attributes = True

class ProvenanceStep(BaseModel):
    step_number: int
    step_type: str # Source, Processed Record, Entity, Relationship, AI Finding, Human Review, Verified Finding
    title: str
    reference_id: str
    timestamp: str
    details: Dict[str, Any] = {}

class ProvenanceChainResponse(BaseModel):
    finding_id: str
    title: str
    confidence: float
    verification_status: str
    lineage_steps: List[ProvenanceStep]

# --- AI & Intelligence ---
class AIFindingOut(BaseModel):
    id: str
    case_id: str
    finding_type: str
    title: str
    source_entity_id: str
    target_entity_id: str
    confidence: float
    status: str
    model_name: str
    model_version: str
    created_at: datetime
    supporting_signals: Dict[str, float] = {}
    evidence_ids: List[str] = []
    explanation_text: str
    provenance_path: List[Dict[str, Any]] = []
    class Config:
        from_attributes = True

class AnomalyOut(BaseModel):
    id: str
    case_id: str
    anomaly_type: str
    title: str
    entity_ids: List[str] = []
    confidence: float
    severity: str
    status: str
    detection_time: datetime
    model_name: str
    model_version: str
    signals: Dict[str, Any] = {}
    evidence_ids: List[str] = []
    description: str
    class Config:
        from_attributes = True

class CrossCaseLinkOut(BaseModel):
    id: str
    source_case_id: str
    target_case_id: str
    shared_entity_id: str
    link_type: str
    confidence: float
    status: str
    supporting_evidence_ids: List[str] = []
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class LeadReviewRequest(BaseModel):
    action: str # VERIFIED, REJECTED, NEED_MORE_EVIDENCE
    reason_code: str
    investigator_notes: str

class ReviewActionOut(BaseModel):
    id: str
    ai_finding_id: str
    case_id: str
    reviewer_user_id: str
    reviewer_name: str
    reviewer_role: str
    action: str
    reason_code: str
    investigator_notes: str
    previous_status: str
    new_status: str
    reviewed_at: datetime
    class Config:
        from_attributes = True

class FindingOut(BaseModel):
    id: str
    case_id: str
    ai_finding_id: Optional[str] = None
    title: str
    summary: str
    finding_type: str
    verified_by: str
    verified_at: datetime
    confidence_level: str
    supporting_entities: List[str] = []
    supporting_evidence: List[str] = []
    court_ready: bool
    created_at: datetime
    class Config:
        from_attributes = True

# --- Timeline ---
class TimelineEventOut(BaseModel):
    id: str
    case_id: str
    timestamp: datetime
    event_type: str
    title: str
    summary: str
    primary_entity_id: Optional[str] = None
    secondary_entity_id: Optional[str] = None
    evidence_id: Optional[str] = None
    source_record_id: Optional[str] = None
    significance: str
    metadata_json: Dict[str, Any] = {}
    created_at: datetime
    class Config:
        from_attributes = True

# --- Reports ---
class ReportGenerateRequest(BaseModel):
    case_id: str
    title: str
    classification: str = "SECRET//LAW ENFORCEMENT SENSITIVE"

class InvestigationReportOut(BaseModel):
    id: str
    case_id: str
    title: str
    classification: str
    generated_by: str
    generated_at: datetime
    checksum_sha256: str
    summary: str
    data_sources_summary: Dict[str, Any] = {}
    entities_summary: Dict[str, Any] = {}
    network_metrics: Dict[str, Any] = {}
    communities_analysis: Dict[str, Any] = {}
    timeline_chronology: List[Dict[str, Any]] = []
    ai_leads_evaluation: Dict[str, Any] = {}
    evidence_provenance_chain: List[Dict[str, Any]] = []
    human_verification_log: List[Dict[str, Any]] = []
    governance_audit_summary: Dict[str, Any] = {}
    status: str
    class Config:
        from_attributes = True

# --- Pipeline & Data Sources ---
class DataSourceOut(BaseModel):
    id: str
    name: str
    source_type: str
    jurisdiction: str
    records_count: int
    entities_created: int
    relationships_created: int
    status: str
    last_sync: datetime
    class Config:
        from_attributes = True

class PipelineRunOut(BaseModel):
    id: str
    pipeline_name: str
    status: str
    started_at: datetime
    completed_at: datetime
    stages_completed: List[Dict[str, Any]] = []
    records_processed: int
    entities_resolved: int
    relationships_inferred: int
    anomalies_detected: int
    execution_time_seconds: float
    logs: Optional[str] = None
    class Config:
        from_attributes = True

class EntityResolutionCandidateOut(BaseModel):
    id: str
    case_id: str
    record_a_id: str
    record_b_id: str
    record_a_name: str
    record_b_name: str
    match_confidence: float
    matching_signals: Dict[str, Any] = {}
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class EntityResolutionDecisionRequest(BaseModel):
    decision: str # MERGE, REJECT
    reviewer_notes: str

class AIModelOut(BaseModel):
    id: str
    model_name: str
    model_type: str
    version: str
    status: str
    dataset_name: str
    training_date: datetime
    metrics: Dict[str, Any] = {}
    parameters: Dict[str, Any] = {}
    class Config:
        from_attributes = True

# --- Governance & Audit ---
class AuditLogOut(BaseModel):
    id: str
    timestamp: datetime
    user_id: str
    username: str
    user_role: str
    action: str
    case_id: Optional[str] = None
    target_object_id: Optional[str] = None
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    reason: str
    ip_address: str
    user_agent: str
    class Config:
        from_attributes = True

class RetentionPolicyOut(BaseModel):
    id: str
    data_classification: str
    retention_period_days: int
    auto_archive: bool
    deletion_schedule: str
    legal_statute: str
    status: str
    class Config:
        from_attributes = True

# --- Global Search ---
class SearchItem(BaseModel):
    id: str
    category: str # Case, Entity, Relationship, Evidence, AI Finding, Community, Timeline
    title: str
    subtitle: str
    route: str
    confidence: Optional[float] = None
    status: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchItem]

# --- Case-Unique Gemini AI Brain Schemas ---
class CaseCognitiveProfileOut(BaseModel):
    case_id: str
    case_title: str
    persona_code: str
    persona_name: str
    specialization: str
    analytical_posture: str
    threat_signature: str
    behavioral_directives: List[str]
    evidentiary_thresholds: Dict[str, Any] = {}
    key_inquiries: List[str]
    model_version: str

class CaseBrainChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class CaseBrainChatResponse(BaseModel):
    case_id: str
    persona_code: str
    persona_name: str
    response: str
    referenced_entities: List[str] = []
    referenced_evidence: List[str] = []
    suggested_next_leads: List[str] = []
    model_used: str
    latency_ms: float

class CaseHypothesisOut(BaseModel):
    id: str
    title: str
    rationale: str
    confidence_score: float
    target_entities: List[str]
    required_evidence_to_verify: List[str]
    recommended_warrants_or_subpoenas: List[str]

class BrainStatusOut(BaseModel):
    status: str
    provider: str
    model: str
    key_configured: bool
    latency_ms: Optional[float] = None
    active_profiles_count: int
