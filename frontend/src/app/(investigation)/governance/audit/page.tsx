'use client';

import React, { useEffect, useState } from 'react';
import { History, Shield, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { AuditLog } from '@/lib/types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const data = await api.getAuditLogs({
          action: actionFilter || undefined,
          limit: 100,
        });
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Immutable Regulatory Audit Trail • Section 40</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            System Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Mandatory recording of authentication events, case access, AI lead review decisions, and dossier compilations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-3 text-xs">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Audited Actions</option>
          <option value="LOGIN">Authentication (LOGIN)</option>
          <option value="CASE_ACCESS">Case Inspection (CASE_ACCESS)</option>
          <option value="EVIDENCE_ACCESS">Evidence Inspection (EVIDENCE_ACCESS)</option>
          <option value="AI_FINDING_ACCESS">AI Finding Inspection (AI_FINDING_ACCESS)</option>
          <option value="REVIEW_DECISION">Human Review Decision (REVIEW_DECISION)</option>
          <option value="REPORT_GENERATION">Dossier Generation (REPORT_GENERATION)</option>
          <option value="CONFIG_CHANGE">Configuration Modification (CONFIG_CHANGE)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User / Officer</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Object</th>
                <th className="px-4 py-3">Reason / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0F172A] whitespace-nowrap">
                    {log.username}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'REVIEW_DECISION'
                          ? 'bg-purple-100 text-purple-800'
                          : log.action === 'REPORT_GENERATION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-600">
                    {log.target_object_id || 'N/A'}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-600 text-xs">
                    {log.reason}
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
