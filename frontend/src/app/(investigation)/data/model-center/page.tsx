'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Microchip, BarChart3, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ModelCenterPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await api.getAIModels();
        setModels(data);
      } catch (err) {
        console.error('Failed to load AI models:', err);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>AI Model Registry & Governance • Section 36</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Model Center
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Model versions, training benchmark datasets, hyperparameters, and operational deployment states.
          </p>
        </div>

        <Link
          href="/data/evaluation"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Evaluation Dashboard</span>
        </Link>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m) => (
          <div
            key={m.id}
            className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{m.id}</span>
                  <span className="font-mono text-xs font-bold text-slate-500">{m.version}</span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F172A] mt-0.5">{m.model_name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {m.status}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-slate-500">
                Task Type: <strong className="text-slate-800">{m.model_type}</strong>
              </div>
              <div className="text-slate-500 font-mono">
                Training Corpus: <strong className="text-slate-800">{m.dataset_name}</strong>
              </div>
            </div>

            {/* Metrics */}
            {m.metrics && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Validated Metrics
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {Object.entries(m.metrics).map(([k, v]: any) => (
                    <div key={k} className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase truncate">{k}:</span>
                      <span className="font-bold text-[#2563EB]">{String(v)}</span>
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
