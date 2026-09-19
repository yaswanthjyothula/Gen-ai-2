'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitFork, Search, Filter, Cpu, ExternalLink } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Relationship } from '@/lib/types';

export default function RelationshipsPage() {
  const { caseId } = useInvestigation();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelationships() {
      setLoading(true);
      try {
        const data = await api.getRelationships({
          case_id: caseId,
          relationship_type: typeFilter || undefined,
          verification_status: statusFilter || undefined,
        });
        setRelationships(data);
      } catch (err) {
        console.error('Failed to load relationships:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRelationships();
  }, [caseId, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Relational Intelligence • {caseId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Network Relationships
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Communications, banking wires, vehicle associations, geolocation co-presences, and corporate holdings.
          </p>
        </div>

        <Link
          href="/investigation/network"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors"
        >
          View in Network Canvas
        </Link>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Relationship Types (8)</option>
          <option value="Communication">Communication</option>
          <option value="Financial">Financial</option>
          <option value="Location">Location</option>
          <option value="Ownership">Ownership</option>
          <option value="Association">Association</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Organisation">Organisation</option>
          <option value="Case">Case</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Verification Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="AI_UNVERIFIED">AI Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Source Target</th>
                <th className="px-4 py-3">Target Node</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Label / Details</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Events</th>
                <th className="px-4 py-3">Source Warrant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {relationships.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">
                    <Link href={`/investigation/entities/${r.source_entity_id}`} className="hover:underline">
                      {r.source_entity_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">
                    <Link href={`/investigation/entities/${r.target_entity_id}`} className="hover:underline">
                      {r.target_entity_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800">
                      {r.relationship_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.label}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.verification_status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {Math.round((r.confidence || 1.0) * 100)}%
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{r.frequency || 1}</td>
                  <td className="px-4 py-3 text-slate-500">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
