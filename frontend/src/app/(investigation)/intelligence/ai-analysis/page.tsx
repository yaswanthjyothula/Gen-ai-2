'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, CheckCircle2, ShieldCheck, Binary, Sparkles, Layers } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { AIFinding } from '@/lib/types';

export default function AIAnalysisPage() {
  const { caseId } = useInvestigation();
  const [findings, setFindings] = useState<AIFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFindings() {
      try {
        const data = await api.getAIFindings(caseId);
        setFindings(data);
      } catch (err) {
        console.error('Failed to load AI findings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFindings();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Graph AI & Link Prediction Engine • Section 23 & 25</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            AI Relationship Discovery
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Predictive link inference and topological signal breakdowns. Rule 4: System proposes leads for investigator review.
          </p>
        </div>

        <Link
          href="/data/evaluation"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-md transition-colors"
        >
          Model Benchmark Metrics
        </Link>
      </div>

      {/* AI Findings List */}
      <div className="space-y-4">
        {findings.map((f) => (
          <div
            key={f.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{f.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {f.status}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-[#2563EB]">{f.finding_type}</span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">{f.title}</h3>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400">Confidence</div>
                  <div className="text-xl font-black text-[#2563EB]">{Math.round(f.confidence * 100)}%</div>
                </div>
                <Link
                  href={`/intelligence/workspace?finding_id=${f.id}`}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Review Lead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">{f.explanation_text}</p>

            {/* Supporting Signals Decomposition Bar */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Supporting Signal Decomposition
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {f.supporting_signals &&
                  Object.entries(f.supporting_signals).map(([sig, val]) => (
                    <div key={sig} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 truncate">{sig}</span>
                        <span className="font-mono font-bold text-[#2563EB]">{Math.round(Number(val) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${Math.round(Number(val) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Model Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>Model Architecture: {f.model_name} ({f.model_version})</span>
              <span>Generated: {new Date(f.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
