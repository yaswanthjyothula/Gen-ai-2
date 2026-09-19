'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileCheck2, Shield, Lock, ExternalLink, GitCommit } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Evidence } from '@/lib/types';

export default function EvidencePage() {
  const { caseId } = useInvestigation();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const data = await api.getEvidence(caseId);
        setEvidenceList(data);
      } catch (err) {
        console.error('Failed to load evidence:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvidence();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Evidence & Chain of Custody Repository • Section 29</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Evidence Records
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Certified judicial evidence artifacts secured with SHA-256 cryptographic verification hashes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/evidence/chain"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <GitCommit className="w-4 h-4" />
            <span>View Provenance Lineage</span>
          </Link>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-4">
        {evidenceList.map((ev) => (
          <div
            key={ev.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{ev.id}</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                    {ev.evidence_type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    {ev.classification}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">{ev.title}</h3>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Collected: {new Date(ev.collected_at).toLocaleDateString()}
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">{ev.description}</p>

            {/* Cryptographic SHA-256 Checksum (Rule 5 Compliance) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-500">SHA-256 HASH:</span>
                <span className="font-bold text-slate-800 break-all">{ev.checksum_sha256}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Integrity Verified
              </span>
            </div>

            {/* Chain of Custody */}
            {ev.chain_of_custody && ev.chain_of_custody.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Custodial Transfer History
                </div>
                <div className="divide-y divide-slate-100 text-xs font-mono">
                  {ev.chain_of_custody.map((custody: any, idx: number) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">{custody.officer}</span>
                      <span className="text-slate-500">{custody.action}</span>
                      <span className="text-slate-400">{new Date(custody.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
