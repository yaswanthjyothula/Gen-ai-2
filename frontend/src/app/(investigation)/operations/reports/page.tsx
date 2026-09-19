'use client';

import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Plus, Download, Lock, CheckCircle2, Shield } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { InvestigationReport } from '@/lib/types';

export default function ReportsPage() {
  const { caseId, currentUser } = useInvestigation();
  const [reports, setReports] = useState<InvestigationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<InvestigationReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState('Operation Cerberus - Full Intelligence Dossier');
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(caseId);
      setReports(data);
      if (data.length > 0) setSelectedReport(data[0]);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [caseId]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await api.generateReport({
        case_id: caseId,
        title: newTitle,
        classification: 'SECRET//LAW ENFORCEMENT SENSITIVE',
      });
      await loadReports();
      setSelectedReport(res);
    } catch (err: any) {
      alert(`Report compilation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Investigative Intelligence Reporting • Section 33</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Intelligence Dossiers & Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Comprehensive multi-section reports maintaining full evidentiary provenance and cryptographic checksums.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{generating ? 'Compiling Dossier...' : 'Generate New Dossier'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Existing Reports List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Compiled Reports ({reports.length})
          </h2>

          <div className="space-y-2">
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedReport?.id === rep.id
                    ? 'bg-white border-[#2563EB] ring-2 ring-blue-100 shadow-sm'
                    : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{rep.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                    {rep.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#0F172A] leading-snug">{rep.title}</h4>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Compiled: {new Date(rep.generated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Full Dossier Viewer */}
        {selectedReport ? (
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
                  <span>{selectedReport.id}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                    {selectedReport.classification}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">{selectedReport.title}</h2>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Compiled by: <strong>{selectedReport.generated_by}</strong>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Stamp */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 font-bold">DOSSIER SHA-256 CHECKSUM: </span>
                <span className="text-slate-800 font-bold break-all">{selectedReport.checksum_sha256}</span>
              </div>
              <span className="text-emerald-600 font-bold uppercase text-[10px]">Tamper-Evident</span>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Executive Investigation Summary
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                {selectedReport.summary}
              </div>
            </div>

            {/* Network Structure Metrics */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Graph Topology & Network Structure
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {selectedReport.network_metrics &&
                  Object.entries(selectedReport.network_metrics).map(([k, v]) => (
                    <div key={k} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{k.replace('_', ' ')}</div>
                      <div className="text-sm font-bold text-[#0F172A] mt-0.5 truncate">{String(v)}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Operational Communities */}
            {selectedReport.communities_analysis && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Algorithmic Community Partitioning
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                  <div>Modularity Score: Q = {selectedReport.communities_analysis.modularity_q}</div>
                  <div className="text-slate-600 mt-1">
                    Partitioned into {selectedReport.communities_analysis.detected_cells} tactical sub-clusters:
                    Executive Command, Financial Conduits, Maritime Distribution, Encrypted Infrastructure.
                  </div>
                </div>
              </div>
            )}

            {/* Governance & Human Verification Log */}
            <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Human Oversight & Legal Concurrence Log
              </h3>
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs space-y-1">
                <div className="font-bold text-[#1E40AF]">Mandatory Procedural Attestation:</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All predictive inferences have been reviewed by a sworn investigating officer in compliance with
                  CRIMENET-X Responsible AI Guidelines. Autonomous adjudication of guilt is strictly prohibited.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white rounded-xl border border-[#E2E8F0]">
            Select a dossier from the left to view full compiled intelligence.
          </div>
        )}
      </div>
    </div>
  );
}
