'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Shield,
  GitFork,
  Boxes,
  Clock,
  FileCheck2,
  Lock,
  ExternalLink,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Entity, Relationship } from '@/lib/types';

export default function EntityDetailPage() {
  const params = useParams();
  const entityId = params.id as string;

  const [profile, setProfile] = useState<{
    entity: Entity;
    aliases: string[];
    relationships: Relationship[];
    relationship_count: number;
    community?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntity() {
      try {
        const data = await api.getEntity(entityId);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load entity profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEntity();
  }, [entityId]);

  if (loading || !profile) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading target entity dossier...
      </div>
    );
  }

  const { entity, aliases, relationships, community } = profile;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
        <Link href="/investigation/entities" className="hover:text-[#2563EB] flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Entities</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-700">{entity.id}</span>
        <span>/</span>
        <span className="text-[#0F172A] font-bold">{entity.name}</span>
      </div>

      {/* Entity Profile Header Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-400">{entity.id}</span>
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-50 text-[#2563EB]">
                {entity.entity_type}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  entity.risk_level === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800'
                    : entity.risk_level === 'HIGH'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {entity.risk_level} RISK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">{entity.name}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/investigation/network?entity_id=${entity.id}`}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <GitFork className="w-4 h-4" />
              <span>Locate in Network</span>
            </Link>
          </div>
        </div>

        {/* Governance Banner: Rule 17 Compliance */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Procedural Constraint:</strong> Entity identity records are legally isolated. The system never silently merges entities without mandatory human judicial concurrence.
          </span>
        </div>

        {/* Identity & Centrality Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-[#E2E8F0] text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Degree Centrality</div>
            <div className="text-lg font-black text-[#0F172A] mt-0.5">
              {entity.degree_centrality ? Number(entity.degree_centrality).toFixed(3) : '0.000'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Betweenness (Bridge Rank)</div>
            <div className="text-lg font-black text-[#2563EB] mt-0.5">
              {entity.betweenness_centrality ? Number(entity.betweenness_centrality).toFixed(3) : '0.000'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Associated Community</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">
              {community?.name || 'Central Command Cell'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Known Aliases</div>
            <div className="text-sm font-semibold text-slate-700 mt-0.5">
              {aliases.length > 0 ? aliases.join(', ') : 'None registered'}
            </div>
          </div>
        </div>

        {/* Attributes Map */}
        {entity.attributes && Object.keys(entity.attributes).length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Forensic Identifiers & Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(entity.attributes).map(([key, val]) => (
                <div key={key} className="p-2.5 bg-white border border-[#E2E8F0] rounded-md text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{key.replace('_', ' ')}</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{String(val)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direct Network Connections Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-sm text-[#0F172A]">
              Direct Relationships & Multi-Hop Edges ({relationships.length})
            </h3>
          </div>
          <Link href="/investigation/relationships" className="text-xs font-bold text-[#2563EB] hover:underline">
            All Relationships →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Connected Target</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Relationship Label</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">First Seen</th>
                <th className="px-4 py-3">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {relationships.map((r) => {
                const otherTarget = r.source_entity_id === entity.id ? r.target_entity_id : r.source_entity_id;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#0F172A]">
                      <Link href={`/investigation/entities/${otherTarget}`} className="hover:text-[#2563EB]">
                        {otherTarget}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800">
                        {r.relationship_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{r.label}</td>
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
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {r.first_seen ? new Date(r.first_seen).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {r.last_seen ? new Date(r.last_seen).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
