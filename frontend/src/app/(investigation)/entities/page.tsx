'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Entity } from '@/lib/types';

export default function EntitiesPage() {
  const { caseId } = useInvestigation();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntities() {
      setLoading(true);
      try {
        const data = await api.getEntities({
          case_id: caseId,
          entity_type: typeFilter || undefined,
          risk_level: riskFilter || undefined,
          search: search || undefined,
        });
        setEntities(data);
      } catch (err) {
        console.error('Failed to load entities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEntities();
  }, [caseId, typeFilter, riskFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Entity Intelligence Repository • {caseId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Entities & Targets
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Authorised targets, shell accounts, burner handsets, vehicles, and operational facilities.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-[#E2E8F0]">
          Total Active Nodes: {entities.length}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search target name, registration, IMEI, IBAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-md text-xs focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Types (8)</option>
          <option value="Person">Person</option>
          <option value="Organisation">Organisation</option>
          <option value="Account">Account</option>
          <option value="Phone">Phone</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Location">Location</option>
          <option value="Device">Device</option>
          <option value="Case">Case</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Risk Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Entities Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">ID / Target Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Betweenness Centrality</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {entities.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-[10px] text-slate-400 font-bold">{e.id}</div>
                    <div className="font-bold text-sm text-[#0F172A]">{e.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800">
                      {e.entity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{e.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.risk_level === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : e.risk_level === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {e.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#2563EB]">
                    {e.betweenness_centrality ? Number(e.betweenness_centrality).toFixed(3) : '0.000'}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {Math.round((e.confidence || 1.0) * 100)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/investigation/entities/${e.id}`}
                      className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded text-[11px] shadow-2xs inline-flex items-center space-x-1 transition-colors"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
