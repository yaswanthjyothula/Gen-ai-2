export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  badge_number?: string;
  department: string;
}

export interface Investigation {
  id: string;
  title: string;
  code_name: string;
  description?: string;
  status: string;
  classification: string;
  created_at: string;
  metadata_json?: Record<string, any>;
}

export interface Case {
  id: string;
  investigation_id: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  lead_officer: string;
  description?: string;
  created_at: string;
  entity_count: number;
  relationship_count: number;
  evidence_count: number;
  findings_count: number;
}

export interface Entity {
  id: string;
  case_id: string;
  name: string;
  entity_type: 'Person' | 'Account' | 'Phone' | 'Vehicle' | 'Location' | 'Organisation' | 'Device' | 'Case';
  category: string;
  confidence: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_verified: boolean;
  status: string;
  degree_centrality: number;
  betweenness_centrality: number;
  closeness_centrality: number;
  community_id?: string;
  attributes: Record<string, any>;
  created_at: string;
}

export interface Relationship {
  id: string;
  case_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  label: string;
  confidence: number;
  weight: number;
  verification_status: 'VERIFIED' | 'AI_UNVERIFIED' | 'REJECTED' | 'PENDING_REVIEW';
  evidence_id?: string;
  source: string;
  first_seen?: string;
  last_seen?: string;
  frequency: number;
  attributes: Record<string, any>;
}

export interface Community {
  id: string;
  case_id: string;
  name: string;
  description?: string;
  size: number;
  density: number;
  primary_entity_id?: string;
  community_type: string;
  modularity_score: number;
  created_at: string;
}

export interface AIFinding {
  id: string;
  case_id: string;
  finding_type: string;
  title: string;
  source_entity_id: string;
  target_entity_id: string;
  confidence: number;
  status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' | 'NEED_MORE_EVIDENCE';
  model_name: string;
  model_version: string;
  created_at: string;
  supporting_signals: Record<string, number>;
  evidence_ids: string[];
  explanation_text: string;
  provenance_path: Array<{ step: number; type: string; ref: string }>;
}

export interface Anomaly {
  id: string;
  case_id: string;
  anomaly_type: string;
  title: string;
  entity_ids: string[];
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  detection_time: string;
  model_name: string;
  model_version: string;
  signals: Record<string, any>;
  evidence_ids: string[];
  description: string;
}

export interface CrossCaseLink {
  id: string;
  source_case_id: string;
  target_case_id: string;
  shared_entity_id: string;
  link_type: string;
  confidence: number;
  status: string;
  supporting_evidence_ids: string[];
  notes?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  timestamp: string;
  event_type: string;
  title: string;
  summary: string;
  primary_entity_id?: string;
  secondary_entity_id?: string;
  evidence_id?: string;
  significance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  metadata_json: Record<string, any>;
}

export interface Evidence {
  id: string;
  case_id: string;
  source_record_id?: string;
  title: string;
  evidence_type: string;
  description?: string;
  classification: string;
  chain_of_custody: Array<{ officer: string; action: string; timestamp: string }>;
  checksum_sha256: string;
  collected_at: string;
  collected_by: string;
  associated_entities: string[];
  associated_relationships: string[];
  is_verified: boolean;
}

export interface SourceRecord {
  id: string;
  source_name: string;
  source_type: string;
  raw_content: string;
  ingestion_timestamp: string;
  checksum_sha256: string;
  status: string;
  metadata_json: Record<string, any>;
}

export interface Finding {
  id: string;
  case_id: string;
  ai_finding_id?: string;
  title: string;
  summary: string;
  finding_type: string;
  verified_by: string;
  verified_at: string;
  confidence_level: string;
  supporting_entities: string[];
  supporting_evidence: string[];
  court_ready: boolean;
}

export interface InvestigationReport {
  id: string;
  case_id: string;
  title: string;
  classification: string;
  generated_by: string;
  generated_at: string;
  checksum_sha256: string;
  summary: string;
  data_sources_summary: Record<string, any>;
  entities_summary: Record<string, any>;
  network_metrics: Record<string, any>;
  communities_analysis: Record<string, any>;
  timeline_chronology: Array<any>;
  ai_leads_evaluation: Record<string, any>;
  evidence_provenance_chain: Array<any>;
  human_verification_log: Array<any>;
  governance_audit_summary: Record<string, any>;
  status: string;
}

export interface DataSource {
  id: string;
  name: string;
  source_type: string;
  jurisdiction: string;
  records_count: number;
  entities_created: number;
  relationships_created: number;
  status: string;
  last_sync: string;
}

export interface PipelineRun {
  id: string;
  pipeline_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  stages_completed: Array<{ stage: string; status: string; [key: string]: any }>;
  records_processed: number;
  entities_resolved: number;
  relationships_inferred: number;
  anomalies_detected: number;
  execution_time_seconds: number;
  logs?: string;
}

export interface EntityResolutionCandidate {
  id: string;
  case_id: string;
  record_a_id: string;
  record_b_id: string;
  record_a_name: string;
  record_b_name: string;
  match_confidence: number;
  matching_signals: Record<string, number>;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  user_role: string;
  action: string;
  case_id?: string;
  target_object_id?: string;
  previous_state?: any;
  new_state?: any;
  reason: string;
  ip_address: string;
  user_agent: string;
}

export interface RetentionPolicy {
  id: string;
  data_classification: string;
  retention_period_days: number;
  auto_archive: boolean;
  deletion_schedule: string;
  legal_statute: string;
  status: string;
}
