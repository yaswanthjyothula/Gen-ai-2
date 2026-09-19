'use client';

import React from 'react';
import Link from 'next/link';
import { X, ExternalLink, ShieldAlert, Cpu, Award, FileText, ArrowRight } from 'lucide-react';

interface NodeDetailDrawerProps {
  data: any | null;
  type: 'node' | 'edge' | null;
  onClose: () => void;
}

export default function NodeDetailDrawer({ data, type, onClose }: NodeDetailDrawerProps) {
  if (!data || !type) return null;

  return (
    <div className="absolute top-4 right-16 w-80 max-h-[550px] overflow-y-auto bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-4 z-20 animate-in fade-in slide-in-from-right-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {type === 'node' ? (data.entity_type || 'Entity') : 'Relationship'}
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] leading-tight mt-0.5">
            {type === 'node' ? (data.name || data.label) : data.label}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Details */}
      {type === 'node' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Risk Assessment:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                data.risk_level === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : data.risk_level === 'HIGH'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {data.risk_level || 'MEDIUM'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Confidence:</span>
            <span className="font-bold text-slate-800">{Math.round((data.confidence || 1.0) * 100)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Betweenness Centrality:</span>
            <span className="font-mono font-semibold text-[#2563EB]">
              {data.betweenness_centrality ? Number(data.betweenness_centrality).toFixed(3) : '0.000'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Degree Centrality:</span>
            <span className="font-mono font-semibold text-slate-800">
              {data.degree_centrality ? Number(data.degree_centrality).toFixed(3) : '0.000'}
            </span>
          </div>

          {data.attributes && Object.keys(data.attributes).length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="font-semibold text-slate-700 text-[11px]">Attributes:</span>
              <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-600 space-y-1">
                {Object.entries(data.attributes).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400 capitalize">{k.replace('_', ' ')}:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link
              href={`/investigation/entities/${data.id}`}
              className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Full Entity Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Edge Details */}
      {type === 'edge' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                data.verification_status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {data.verification_status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Type:</span>
            <span className="font-bold text-slate-800">{data.relationship_type}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Connected Nodes:</span>
            <span className="font-mono text-slate-700">{data.source} ↔ {data.target}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Weight / Frequency:</span>
            <span className="font-bold text-slate-800">{data.frequency || 1} events</span>
          </div>

          {data.verification_status === 'AI_UNVERIFIED' && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Predicted Relationship</span>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-800">
                Inferred by Link Prediction Engine v2.4 based on topological similarity and financial flow coincidence.
              </p>
              <div className="pt-1">
                <Link
                  href="/intelligence/workspace"
                  className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center space-x-1"
                >
                  <span>Open in Investigation Workspace →</span>
                </Link>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/investigation/relationships"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-md shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>View In Relationships Table</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
