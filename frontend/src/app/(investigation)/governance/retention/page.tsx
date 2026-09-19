'use client';

import React, { useEffect, useState } from 'react';
import { Archive, ShieldAlert, Clock, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { RetentionPolicy } from '@/lib/types';

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const data = await api.getRetentionPolicies();
        setPolicies(data);
      } catch (err) {
        console.error('Failed to load retention policies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Statutory Lifecycle Management • Section 41</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Data Retention & Expungement
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Automated legal retention schedules and secure expungement policies for criminal intelligence records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Retention Period</th>
              <th className="px-4 py-3">Purge Schedule</th>
              <th className="px-4 py-3">Legal Statute / Warrant Order</th>
              <th className="px-4 py-3">Auto Archive</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {policies.map((pol) => (
              <tr key={pol.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">{pol.data_classification}</td>
                <td className="px-4 py-3 font-bold text-slate-800">
                  {pol.retention_period_days} Days ({Math.round(pol.retention_period_days / 365)} years)
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">{pol.deletion_schedule}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">{pol.legal_statute}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {pol.auto_archive ? 'ENABLED' : 'MANUAL'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                    {pol.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
