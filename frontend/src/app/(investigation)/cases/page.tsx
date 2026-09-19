'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, Shield, Layers, Plus } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Case } from '@/lib/types';

export default function CasesPage() {
  const { setCaseId } = useInvestigation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await api.getCases();
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Case Management • Section 16</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Investigation Cases
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Active and archived criminal case files linked within Operation CERBERUS.
          </p>
        </div>

        <Link
          href="/investigation/overview"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Layers className="w-4 h-4" />
          <span>Active Command Center</span>
        </Link>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Title & Summary</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Lead Officer</th>
                <th className="px-4 py-3">Entities</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">{c.id}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-bold text-sm text-[#0F172A]">{c.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{c.description}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{c.case_type}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{c.lead_officer}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{c.entity_count}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{c.evidence_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setCaseId(c.id);
                      }}
                      className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded text-[11px] transition-colors"
                    >
                      Set Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
