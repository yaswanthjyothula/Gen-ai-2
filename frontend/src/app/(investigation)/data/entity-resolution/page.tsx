'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck2, Check, X, ShieldAlert } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { EntityResolutionCandidate } from '@/lib/types';

export default function EntityResolutionPage() {
  const { caseId } = useInvestigation();
  const [candidates, setCandidates] = useState<EntityResolutionCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCandidates = async () => {
    try {
      const data = await api.getEntityResolutionCandidates(caseId);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load ER candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [caseId]);

  const handleDecision = async (candidateId: string, decision: 'MERGE' | 'REJECT') => {
    try {
      await api.decideEntityResolution(candidateId, {
        decision,
        reviewer_notes: `Judicial resolution decision: ${decision} recorded.`,
      });
      await loadCandidates();
    } catch (err: any) {
      alert(`Decision failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Deterministic & Fuzzy Matching • Section 18</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Entity Resolution Workflow
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Multi-signal matching (DOBs, phone token overlap, Levenshtein distance, address proximity) requiring investigator concurrence.
          </p>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{c.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'MERGED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">
                  Potential Same Entity Candidate
                </h3>
              </div>

              <div className="text-right text-xs font-bold">
                <span className="text-slate-400">Match Confidence: </span>
                <span className="text-lg font-black text-[#2563EB]">
                  {Math.round(c.match_confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Registered Record A</div>
                <div className="font-black text-sm text-[#0F172A]">{c.record_a_name}</div>
                <div className="font-mono text-[11px] text-slate-500">ID: {c.record_a_id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Incoming Record B</div>
                <div className="font-black text-sm text-[#0F172A]">{c.record_b_name}</div>
                <div className="font-mono text-[11px] text-slate-500">ID: {c.record_b_id}</div>
              </div>
            </div>

            {/* Matching Signals Breakdown (Section 18) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Matching Signals Explanation
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {c.matching_signals &&
                  Object.entries(c.matching_signals).map(([sig, val]) => (
                    <div key={sig} className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block truncate">{sig}:</span>
                      <span className="font-bold text-[#2563EB]">{Math.round(Number(val) * 100)}% Match</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Decision Controls */}
            {c.status === 'PENDING_REVIEW' && (
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => handleDecision(c.id, 'MERGE')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Merge Target Identity</span>
                </button>
                <button
                  onClick={() => handleDecision(c.id, 'REJECT')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Dismiss / Distinct Targets</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
