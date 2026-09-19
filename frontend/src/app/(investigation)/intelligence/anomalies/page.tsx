'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { Anomaly } from '@/lib/types';

export default function AnomaliesPage() {
  const { caseId } = useInvestigation();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnomalies() {
      try {
        const data = await api.getAnomalies(caseId);
        setAnomalies(data);
      } catch (err) {
        console.error('Failed to load anomalies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Graph & Activity Anomalies • Section 26</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Flagged Anomaly Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Statistical outliers, encrypted burst communication surges, coordinate co-presence rendezvous, and structured banking cycles.
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-rose-400 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-rose-600">{anom.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      anom.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {anom.severity}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700">{anom.anomaly_type}</span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A]">{anom.title}</h3>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400">Confidence</div>
                  <div className="text-xl font-black text-rose-600">{Math.round(anom.confidence * 100)}%</div>
                </div>
                <Link
                  href="/intelligence/workspace"
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">{anom.description}</p>

            {/* Signals Payload */}
            {anom.signals && Object.keys(anom.signals).length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1 font-mono">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Outlier Feature Signals
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {Object.entries(anom.signals).map(([k, v]: any) => (
                    <div key={k} className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">{k}:</span>
                      <span className="font-bold text-slate-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
