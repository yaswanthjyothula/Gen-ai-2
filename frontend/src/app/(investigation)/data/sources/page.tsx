'use client';

import React, { useEffect, useState } from 'react';
import { Server, CheckCircle2, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { DataSource } from '@/lib/types';

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getDataSources();
        setSources(data);
      } catch (err) {
        console.error('Failed to load data sources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Authorized Ingestion Registry • Section 35</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Data Sources
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Court warrants, telephony CDR feeds, financial intelligence networks, and maritime plate cameras.
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#2563EB]">{src.id}</span>
                <h3 className="font-extrabold text-base text-[#0F172A] mt-0.5">{src.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {src.status}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-500">
              Jurisdictional Authority: <strong className="text-slate-800">{src.jurisdiction}</strong>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Records Ingested</div>
                <div className="text-sm font-black text-[#0F172A] mt-0.5">{src.records_count}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Entities Derived</div>
                <div className="text-sm font-black text-[#2563EB] mt-0.5">{src.entities_created}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Relations Extracted</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{src.relationships_created}</div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-1">
              Last Synchronized: {new Date(src.last_sync).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
