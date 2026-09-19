'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Lock, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { SourceRecord } from '@/lib/types';

export default function SourceRecordsPage() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getSourceRecords();
        setSources(data);
      } catch (err) {
        console.error('Failed to load source records:', err);
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
            <span>Raw Ingested Records • Section 29</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Authorised Source Records
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Unmodified raw surveillance feeds, CDR telecom batches, and FinCEN SAR payloads.
          </p>
        </div>

        <Link
          href="/evidence"
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors"
        >
          Back to Evidence
        </Link>
      </div>

      {/* Sources Grid */}
      <div className="space-y-4">
        {sources.map((s) => (
          <div
            key={s.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#2563EB]">{s.id}</span>
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                  {s.source_type}
                </span>
                <span className="font-bold text-xs text-[#0F172A]">{s.source_name}</span>
              </div>
              <div className="font-mono text-xs text-slate-400">
                {new Date(s.ingestion_timestamp).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Raw Content Payload</div>
              <pre className="whitespace-pre-wrap font-mono">{s.raw_content}</pre>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>SHA-256: {s.checksum_sha256}</span>
              <span className="text-emerald-600 font-bold">STATUS: {s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
