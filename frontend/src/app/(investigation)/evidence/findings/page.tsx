'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ShieldCheck, FileCheck2, ArrowRight } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Finding } from '@/lib/types';

export default function VerifiedFindingsPage() {
  const { caseId } = useInvestigation();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFindings() {
      try {
        const data = await api.getVerifiedFindings(caseId);
        setFindings(data);
      } catch (err) {
        console.error('Failed to load verified findings:', err);
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
            <span>Decision-Support Outcomes • Section 32</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Official Verified Findings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Definitive criminal network discoveries corroborated by human investigators and validated for legal prosecution.
          </p>
        </div>

        <Link
          href="/operations/reports"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Award className="w-4 h-4" />
          <span>Compile Formal Dossier</span>
        </Link>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.map((f) => (
          <div
            key={f.id}
            className="p-6 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-700">{f.id}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    HUMAN VERIFIED
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-700">{f.finding_type}</span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">{f.title}</h3>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Verified: {new Date(f.verified_at).toLocaleDateString()}
              </div>
            </div>

            <p className="text-xs text-[#0F172A] leading-relaxed font-medium bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              {f.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified By</span>
                <span className="font-bold text-slate-800">{f.verified_by}</span>
              </div>
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidentiary Standard</span>
                <span className="font-bold text-[#2563EB]">{f.confidence_level}</span>
              </div>
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Court Status</span>
                <span className="font-bold text-emerald-600">
                  {f.court_ready ? 'Court-Ready Evidentiary Exhibit' : 'Internal Working Draft'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
