'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Link2, ShieldAlert, ArrowRight, Layers, FileCheck2 } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { CrossCaseLink } from '@/lib/types';

export default function CrossCasePage() {
  const { caseId } = useInvestigation();
  const [links, setLinks] = useState<CrossCaseLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      try {
        const data = await api.getCrossCaseLinks(caseId);
        setLinks(data);
      } catch (err) {
        console.error('Failed to load cross-case links:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Inter-Agency Cross-Case Analysis • Section 27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Cross-Case Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Authorised shared entities, assets, vehicles, and shell accounts identified across distinct jurisdictional dockets.
          </p>
        </div>
      </div>

      {/* Mandatory Governance Alert (Section 27) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
        <div className="font-bold flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>STATUTORY MANDATE: Requires Investigator Review</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          CRIMENET-X strictly enforces: <em>Never infer guilt from shared entities.</em> Presence of an asset or vehicle across multiple dockets serves exclusively as an investigative lead subject to corroboration.
        </p>
      </div>

      {/* Cross-case Links Grid */}
      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#2563EB]">{link.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  REQUIRES REVIEW
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-700">{link.link_type}</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-[#2563EB]">{Math.round(link.confidence * 100)}%</strong>
              </div>
            </div>

            {/* Case Conduit Diagram */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs">
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Docket A</div>
                <div className="font-mono font-bold text-sm text-[#0F172A]">{link.source_case_id}</div>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Shared Entity</div>
                <Link
                  href={`/investigation/entities/${link.shared_entity_id}`}
                  className="font-mono font-black text-xs text-[#2563EB] hover:underline"
                >
                  {link.shared_entity_id}
                </Link>
                <div className="text-slate-400 text-xs">↔</div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Docket B</div>
                <div className="font-mono font-bold text-sm text-[#0F172A]">{link.target_case_id}</div>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">{link.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
