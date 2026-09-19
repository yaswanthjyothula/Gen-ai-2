'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTodo, ArrowRight, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { AIFinding } from '@/lib/types';

export default function ReviewQueuePage() {
  const { caseId } = useInvestigation();
  const [queue, setQueue] = useState<AIFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        const data = await api.getReviewQueue(caseId);
        setQueue(data);
      } catch (err) {
        console.error('Failed to load review queue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Investigator Operations • Section 31</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Human Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            All AI candidate leads requiring certified investigator concurrence before promotion to official findings.
          </p>
        </div>

        <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
          Pending Inferences: {queue.length}
        </div>
      </div>

      {/* Queue Items List */}
      {queue.length > 0 ? (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{item.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      AWAITING REVIEW
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-[#2563EB]">{item.finding_type}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">{item.title}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400">Confidence</div>
                    <div className="text-xl font-black text-[#2563EB]">{Math.round(item.confidence * 100)}%</div>
                  </div>
                  <Link
                    href={`/intelligence/workspace?finding_id=${item.id}`}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <span>Open in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">{item.explanation_text}</p>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Targets: {item.source_entity_id} ↔ {item.target_entity_id}</span>
                <span>Model: {item.model_name} ({item.model_version})</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <div className="font-bold text-sm text-[#0F172A]">All AI Leads Reviewed</div>
          <div className="text-xs text-slate-500">There are no unverified leads pending in the review queue.</div>
        </div>
      )}
    </div>
  );
}
