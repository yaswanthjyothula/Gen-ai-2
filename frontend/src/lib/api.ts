const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('crimenet_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // ignore
    }
    throw new Error(errorJson?.detail || `API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request<any>('/auth/me'),

  // Investigations & Cases
  getInvestigations: () => request<any[]>('/investigations'),
  getInvestigation: (id: string) => request<any>(`/investigations/${id}`),
  getCases: (investigationId?: string) =>
    request<any[]>(`/cases${investigationId ? `?investigation_id=${investigationId}` : ''}`),
  getCase: (id: string) => request<any>(`/cases/${id}`),

  // Entities & Communities
  getEntities: (params?: { case_id?: string; entity_type?: string; risk_level?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.case_id) q.set('case_id', params.case_id);
    if (params?.entity_type) q.set('entity_type', params.entity_type);
    if (params?.risk_level) q.set('risk_level', params.risk_level);
    if (params?.search) q.set('search', params.search);
    return request<any[]>(`/entities?${q.toString()}`);
  },
  getEntity: (id: string) => request<any>(`/entities/${id}`),
  getCommunities: (caseId?: string) =>
    request<any[]>(`/communities${caseId ? `?case_id=${caseId}` : ''}`),

  // Relationships
  getRelationships: (params?: { case_id?: string; relationship_type?: string; verification_status?: string }) => {
    const q = new URLSearchParams();
    if (params?.case_id) q.set('case_id', params.case_id);
    if (params?.relationship_type) q.set('relationship_type', params.relationship_type);
    if (params?.verification_status) q.set('verification_status', params.verification_status);
    return request<any[]>(`/relationships?${q.toString()}`);
  },

  // Network & Cytoscape
  getNetwork: (params?: { case_id?: string; date_from?: string; date_to?: string; community_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.case_id) q.set('case_id', params.case_id);
    if (params?.date_from) q.set('date_from', params.date_from);
    if (params?.date_to) q.set('date_to', params.date_to);
    if (params?.community_id) q.set('community_id', params.community_id);
    return request<any>(`/network?${q.toString()}`);
  },
  getShortestPath: (sourceId: string, targetId: string, caseId?: string) =>
    request<any>('/network/shortest-path', {
      method: 'POST',
      body: JSON.stringify({ source_entity_id: sourceId, target_entity_id: targetId }),
    }),
  getCentrality: (caseId?: string) =>
    request<any>(`/network/centrality${caseId ? `?case_id=${caseId}` : ''}`),

  // Intelligence & Anomalies
  getAIFindings: (caseId?: string, status?: string) => {
    const q = new URLSearchParams();
    if (caseId) q.set('case_id', caseId);
    if (status) q.set('status', status);
    return request<any[]>(`/intelligence/findings?${q.toString()}`);
  },
  getAIFinding: (id: string) => request<any>(`/intelligence/findings/${id}`),
  getAnomalies: (caseId?: string, severity?: string) => {
    const q = new URLSearchParams();
    if (caseId) q.set('case_id', caseId);
    if (severity) q.set('severity', severity);
    return request<any[]>(`/anomalies?${q.toString()}`);
  },
  getCrossCaseLinks: (sourceCaseId?: string) =>
    request<any[]>(`/cross-case${sourceCaseId ? `?source_case_id=${sourceCaseId}` : ''}`),

  // Review Queue & Human Verification
  getReviewQueue: (caseId?: string) =>
    request<any[]>(`/reviews/queue${caseId ? `?case_id=${caseId}` : ''}`),
  submitLeadReview: (findingId: string, review: { action: string; reason_code: string; investigator_notes: string }) =>
    request<any>(`/reviews/findings/${findingId}`, {
      method: 'POST',
      body: JSON.stringify(review),
    }),
  getReviewHistory: (caseId?: string) =>
    request<any[]>(`/reviews/history${caseId ? `?case_id=${caseId}` : ''}`),

  // Evidence & Provenance
  getEvidence: (caseId?: string) =>
    request<any[]>(`/evidence${caseId ? `?case_id=${caseId}` : ''}`),
  getSourceRecords: () => request<any[]>('/evidence/sources'),
  getVerifiedFindings: (caseId?: string) =>
    request<any[]>(`/evidence/findings${caseId ? `?case_id=${caseId}` : ''}`),
  getProvenanceChain: (findingId: string) =>
    request<any>(`/evidence/provenance-chain/${findingId}`),

  // Timeline
  getTimeline: (params?: { case_id?: string; event_type?: string; significance?: string }) => {
    const q = new URLSearchParams();
    if (params?.case_id) q.set('case_id', params.case_id);
    if (params?.event_type) q.set('event_type', params.event_type);
    if (params?.significance) q.set('significance', params.significance);
    return request<any[]>(`/timeline?${q.toString()}`);
  },

  // Reports
  getReports: (caseId?: string) =>
    request<any[]>(`/reports${caseId ? `?case_id=${caseId}` : ''}`),
  getReport: (id: string) => request<any>(`/reports/${id}`),
  generateReport: (data: { case_id: string; title: string; classification?: string }) =>
    request<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Data Pipeline & Entity Resolution
  getDataSources: () => request<any[]>('/data-sources'),
  getPipelineRuns: () => request<any[]>('/pipeline/runs'),
  triggerPipeline: () => request<any>('/pipeline/trigger', { method: 'POST' }),
  getEntityResolutionCandidates: (caseId?: string) =>
    request<any[]>(`/entity-resolution/candidates${caseId ? `?case_id=${caseId}` : ''}`),
  decideEntityResolution: (id: string, decision: { decision: string; reviewer_notes: string }) =>
    request<any>(`/entity-resolution/candidates/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify(decision),
    }),

  // Model Center & Evaluation
  getAIModels: () => request<any[]>('/models'),
  getEvaluationDashboard: () => request<any>('/evaluation'),

  // Governance & Audit
  getAuditLogs: (params?: { case_id?: string; action?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.case_id) q.set('case_id', params.case_id);
    if (params?.action) q.set('action', params.action);
    if (params?.limit) q.set('limit', String(params.limit));
    return request<any[]>(`/audit?${q.toString()}`);
  },
  getRetentionPolicies: () => request<any[]>('/governance/policies'),
  getUsers: () => request<any[]>('/governance/users'),

  // Search
  search: (query: string, caseId?: string) => {
    const q = new URLSearchParams();
    q.set('q', query);
    if (caseId) q.set('case_id', caseId);
    return request<any>(`/search?${q.toString()}`);
  },

  // Case AI Brain (Google Gemini 3.6-Flash)
  getBrainStatus: () => request<any>('/intelligence/case-brain/status'),
  getCaseBrainProfile: (caseId: string) => request<any>(`/cases/${caseId}/ai-brain/profile`),
  chatWithCaseBrain: (caseId: string, message: string, conversationHistory?: any[]) =>
    request<any>(`/cases/${caseId}/ai-brain/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: conversationHistory || [] }),
    }),
  getCaseHypotheses: (caseId: string) =>
    request<any[]>(`/cases/${caseId}/ai-brain/hypotheses`, { method: 'POST' }),
  compareCaseProfiles: (caseId: string, compareToCaseId: string = 'CASE-0192') =>
    request<any>(`/cases/${caseId}/ai-brain/compare-profiles?compare_to_case_id=${compareToCaseId}`),
};
