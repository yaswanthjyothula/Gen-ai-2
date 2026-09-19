'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  FileCheck2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Award,
  Layers
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { AIFinding, Evidence } from '@/lib/types';

export default function InvestigationWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const queryFindingId = searchParams.get('finding_id');
  const { caseId, refreshReviewCount } = useInvestigation();

  const [findings, setFindings] = useState<AIFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<AIFinding | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [reasonCode, setReasonCode] = useState<string>('CONFIRMED_BY_CORROBORATING_BANK_RECORDS');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const [findingsData, evData] = await Promise.all([
          api.getAIFindings(caseId),
          api.getEvidence(caseId),
        ]);
        setFindings(findingsData);
        setEvidenceList(evData);

        if (queryFindingId) {
          const target = findingsData.find((f) => f.id === queryFindingId);
          if (target) setSelectedFinding(target);
          else if (findingsData.length > 0) setSelectedFinding(findingsData[0]);
        } else if (findingsData.length > 0) {
          setSelectedFinding(findingsData[0]);
        }
      } catch (err) {
        console.error('Error loading workspace:', err);
      }
    }
    loadWorkspaceData();
  }, [caseId, queryFindingId]);

  const handleReviewAction = async (action: 'VERIFIED' | 'REJECTED' | 'NEED_MORE_EVIDENCE') => {
    if (!selectedFinding) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await api.submitLeadReview(selectedFinding.id, {
        action,
        reason_code: reasonCode,
        investigator_notes: notes || `Investigator concurrence: decision ${action} recorded by human review.`,
      });

      setSuccessMessage(
        action === 'VERIFIED'
          ? `Lead ${selectedFinding.id} successfully promoted to Verified Finding with court-ready status.`
          : `Lead ${selectedFinding.id} review recorded as ${action}.`
      );

      // Refresh list
      const updatedFindings = await api.getAIFindings(caseId);
      setFindings(updatedFindings);
      const current = updatedFindings.find((f) => f.id === selectedFinding.id);
      if (current) setSelectedFinding(current);
      refreshReviewCount();
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Contract Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Human-in-the-Loop Decision Support • Rule 4 Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Investigation Lead Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Examine AI candidate relationships, inspect underlying signals and primary evidence, and record official human verification decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/operations/review-queue"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors"
          >
            Review Queue
          </Link>
          <Link
            href="/evidence/chain"
            className="px-3 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>View Provenance Chain</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: AI Leads Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            AI Discovered Leads ({findings.length})
          </h2>

          <div className="space-y-2">
            {findings.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFinding(f);
                  setSuccessMessage(null);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedFinding?.id === f.id
                    ? 'bg-white border-[#2563EB] ring-2 ring-blue-100 shadow-sm'
                    : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{f.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#0F172A] leading-snug">{f.title}</h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Confidence: <strong className="text-[#2563EB]">{Math.round(f.confidence * 100)}%</strong></span>
                  <span className="text-[10px] text-slate-400">{f.model_version}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Deep Review Workspace */}
        {selectedFinding ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Finding Detail Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
                    <span>{selectedFinding.id}</span>
                    <span>•</span>
                    <span className="text-[#2563EB] font-bold">{selectedFinding.finding_type}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">{selectedFinding.title}</h3>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xs text-slate-400 font-semibold">Model Confidence</div>
                  <div className="text-2xl font-black text-[#2563EB]">
                    {Math.round(selectedFinding.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Targets Involved */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Subject Target A</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{selectedFinding.source_entity_id}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Subject Target B</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{selectedFinding.target_entity_id}</div>
                </div>
              </div>

              {/* Explanation Summary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Rationale</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
                  {selectedFinding.explanation_text}
                </p>
              </div>

              {/* Supporting Signal Percentages (Section 25) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantitative Signal Weighting
                </h4>
                <div className="space-y-2">
                  {selectedFinding.supporting_signals &&
                    Object.entries(selectedFinding.supporting_signals).map(([sig, val]) => (
                      <div key={sig} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span>{sig}</span>
                          <span className="font-mono font-bold text-[#2563EB]">{Math.round(Number(val) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                            style={{ width: `${Math.round(Number(val) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Supporting Evidence Records */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Corroborating Evidence Records
                </h4>
                <div className="space-y-2">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg border border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{ev.id}</span>
                          <span>•</span>
                          <span>{ev.evidence_type}</span>
                        </div>
                        <div className="font-bold text-[#0F172A]">{ev.title}</div>
                      </div>
                      <Link
                        href={`/evidence?evidence_id=${ev.id}`}
                        className="px-2.5 py-1 text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Decision Review Form (Section 30) */}
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4 pt-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#60A5FA]" />
                    <span>Investigator Concurrence & Verification Decision</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Rule 4: AI produces decision-support leads. Official findings require documented human concurrence.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Reason Code:</label>
                    <select
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value)}
                      className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white text-xs font-medium"
                    >
                      <option value="CONFIRMED_BY_CORROBORATING_BANK_RECORDS">
                        Confirmed by Subpoenaed Bank Records & Wires
                      </option>
                      <option value="CONFIRMED_BY_TITLE_III_WIRETAP">
                        Confirmed by Title III Audio Intercept Transcript
                      </option>
                      <option value="CONFIRMED_BY_PHYSICAL_SURVEILLANCE">
                        Confirmed by Photographic & ALPR Telemetry
                      </option>
                      <option value="INSUFFICIENT_PROBATIVE_VALUE">
                        Insufficient Probative Value to Proceed
                      </option>
                      <option value="NO_CORROBORATING_CDR_RECORDS">
                        No Corroborating Telecom Records Identified
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Investigator Review Notes:</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail corroborating records, warrant docket references, and investigative rationale..."
                      className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleReviewAction('VERIFIED')}
                      disabled={submitting}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Finding</span>
                    </button>
                    <button
                      onClick={() => handleReviewAction('REJECTED')}
                      disabled={submitting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Lead</span>
                    </button>
                    <button
                      onClick={() => handleReviewAction('NEED_MORE_EVIDENCE')}
                      disabled={submitting}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 disabled:opacity-50 text-slate-200 font-bold rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Request More Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 bg-white rounded-xl border border-[#E2E8F0] text-center text-slate-400">
            Select an AI finding lead from the left to open the workspace.
          </div>
        )}
      </div>
    </div>
  );
}
