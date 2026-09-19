'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { PipelineRun } from '@/lib/types';

export default function PipelinePage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRuns = async () => {
    try {
      const data = await api.getPipelineRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to load pipeline runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleTrigger = async () => {
    setRunning(true);
    try {
      await api.triggerPipeline();
      await loadRuns();
    } catch (err: any) {
      alert(`Pipeline execution failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>ETL & Graph Construction Pipeline • Section 34</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Data & Graph Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            End-to-end automated sequence: Raw Ingestion → Normalisation → Entity Resolution → Relationship Extraction → Graph Inference.
          </p>
        </div>

        <button
          onClick={handleTrigger}
          disabled={running}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Play className="w-4 h-4" />
          <span>{running ? 'Running Pipeline...' : 'Trigger Pipeline Run'}</span>
        </button>
      </div>

      {/* Pipeline Stage Architecture Visualizer */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Standard Investigative Transformation Architecture
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          {[
            '1. Raw Ingestion',
            '2. Validation',
            '3. Anonymisation',
            '4. Resolution',
            '5. Relation Extraction',
            '6. Graph Build',
            '7. AI Inference',
          ].map((stage, idx) => (
            <div key={stage} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
              <div className="font-bold text-[11px] text-[#0F172A]">{stage}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Active</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Runs Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] font-bold text-xs text-[#0F172A]">
          Pipeline Run History
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {runs.map((r) => (
            <div key={r.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">{r.id}</span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {r.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#0F172A]">{r.pipeline_name}</div>
                </div>

                <div className="text-right text-xs font-mono text-slate-500">
                  Execution Duration: <strong>{r.execution_time_seconds}s</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>Processed: <strong>{r.records_processed} records</strong></div>
                <div>Resolved: <strong>{r.entities_resolved} targets</strong></div>
                <div>Inferred: <strong>{r.relationships_inferred} links</strong></div>
                <div>Anomalies: <strong>{r.anomalies_detected} flagged</strong></div>
              </div>

              {r.logs && (
                <div className="text-[11px] font-mono text-slate-500 bg-slate-900 text-slate-300 p-2 rounded">
                  {r.logs}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
