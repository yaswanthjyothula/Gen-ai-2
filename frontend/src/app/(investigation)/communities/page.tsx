'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes, Users, GitFork, ArrowRight } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Community } from '@/lib/types';

export default function CommunitiesPage() {
  const { caseId } = useInvestigation();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunities() {
      try {
        const data = await api.getCommunities(caseId);
        setCommunities(data);
      } catch (err) {
        console.error('Failed to load communities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunities();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Community Detection • Louvain Modularity Algorithm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Detected Operational Cells
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Algorithmic partitioning isolating tactical command, laundering conduits, freight distribution, and cyber infrastructure.
          </p>
        </div>

        <div className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-md">
          Modularity Score: Q = 0.814
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#2563EB]">{c.id}</span>
                <h3 className="font-extrabold text-base text-[#0F172A] mt-0.5">{c.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs">
                {c.community_type}
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">{c.description}</p>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Size</div>
                <div className="text-sm font-black text-[#0F172A] mt-0.5">{c.size} Nodes</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Internal Density</div>
                <div className="text-sm font-mono font-bold text-[#2563EB] mt-0.5">
                  {Number(c.density).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Primary Node</div>
                <div className="text-xs font-mono font-bold text-slate-700 mt-0.5 truncate">
                  {c.primary_entity_id || 'ENT-101'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href={`/investigation/network?community_id=${c.id}`}
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
              >
                <span>Filter Network by this Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
