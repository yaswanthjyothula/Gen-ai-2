'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GitCommit,
  ShieldCheck,
  FileCheck2,
  Database,
  Users,
  GitFork,
  Cpu,
  UserCheck,
  Award,
  ArrowDown,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';

export default function EvidenceChainPage() {
  const { caseId } = useInvestigation();
  const [chainData, setChainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChain() {
      try {
        // Load chain for primary unverified/verified lead FIND-901
        const data = await api.getProvenanceChain('FIND-901');
        setChainData(data);
      } catch (err) {
        console.error('Failed to load provenance chain:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChain();
  }, [caseId]);

  const getStepIcon = (type: string) => {
    if (type.includes('Source')) return Database;
    if (type.includes('Evidence')) return FileCheck2;
    if (type.includes('Entity')) return Users;
    if (type.includes('AI')) return Cpu;
    if (type.includes('Review')) return UserCheck;
    return Award;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Evidence Integrity & Traceability Engine • Section 29</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Evidence Provenance Chain
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Auditable mathematical and procedural lineage tracking every AI lead back to source subpoenas and custodial hashes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/evidence"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors"
          >
            Evidence Repository
          </Link>
          <Link
            href="/evidence/sources"
            className="px-3 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
          >
            Source Records
          </Link>
        </div>
      </div>

      {/* Target Finding Reference Banner */}
      <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Target Finding:</span>
            <span className="font-bold text-[#2563EB]">{chainData?.finding_id || 'FIND-901'}</span>
            <span>•</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {chainData?.verification_status || 'VERIFIED'}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-[#0F172A]">
            {chainData?.title || 'Potential Undisclosed Association: Marcus Vance ↔ Sarah Jenkins'}
          </h3>
        </div>

        <div className="text-xs font-mono bg-slate-50 px-3 py-2 rounded-md border border-[#E2E8F0] text-slate-600">
          <span className="font-bold text-slate-400">WARRANT DOCKET: </span>
          <span className="font-bold text-slate-800">SDNY-2026-CR-0147</span>
        </div>
      </div>

      {/* Step-by-Step Interactive Provenance Lineage */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#2563EB]/40">
        {chainData?.lineage_steps.map((step: any) => {
          const Icon = getStepIcon(step.step_type);
          return (
            <div key={step.step_number} className="relative group">
              {/* Step Node Marker */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0F172A] border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-md">
                {step.step_number}
              </div>

              {/* Step Card */}
              <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded bg-blue-50 text-[#2563EB]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#2563EB] uppercase tracking-wider">
                      {step.step_type}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs font-bold text-slate-600">{step.reference_id}</span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400">
                    {new Date(step.timestamp).toLocaleString()}
                  </div>
                </div>

                <h4 className="font-black text-sm text-[#0F172A]">{step.title}</h4>

                {/* Details table / key-values */}
                {step.details && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                    {Object.entries(step.details).map(([k, v]: any) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="font-bold text-slate-800 break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
