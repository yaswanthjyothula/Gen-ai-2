'use client';

import React from 'react';
import { Lock, Shield, Users, Check, X } from 'lucide-react';

export default function AccessControlPage() {
  const roles = [
    {
      role: 'Administrator',
      desc: 'System oversight, user management, audit review, pipeline triggering, and model deployments.',
      permissions: { cases: 'Full', entities: 'Full', reviews: 'Full', pipeline: 'Full', audit: 'Read', settings: 'Full' },
    },
    {
      role: 'Investigator',
      desc: 'Sworn lead detective. Dossier management, target inspection, evidence custody, lead review & verification.',
      permissions: { cases: 'Write', entities: 'Write', reviews: 'Verify/Reject', pipeline: 'Run', audit: 'Read', settings: 'None' },
    },
    {
      role: 'Analyst',
      desc: 'Intelligence specialist. Advanced network graph queries, shortest path mining, and dossier compilation.',
      permissions: { cases: 'Read', entities: 'Read', reviews: 'Propose Lead', pipeline: 'Run', audit: 'None', settings: 'None' },
    },
    {
      role: 'Reviewer',
      desc: 'Supervising attorney / counsel. Quality control of AI leads, concurrence verification, legal review.',
      permissions: { cases: 'Read', entities: 'Read', reviews: 'Verify/Reject', pipeline: 'None', audit: 'Read', settings: 'None' },
    },
    {
      role: 'Auditor',
      desc: 'Internal affairs & compliance oversight. Independent read-only access to audit logs and provenance.',
      permissions: { cases: 'Read', entities: 'Read', reviews: 'Read', pipeline: 'None', audit: 'Full Read', settings: 'None' },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Role-Based Access Control (RBAC) • Section 39</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Access Control Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Backend-enforced permission roles preventing unauthorized modification or data leakage.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Description & Responsibilities</th>
              <th className="px-4 py-3">Cases</th>
              <th className="px-4 py-3">Entities</th>
              <th className="px-4 py-3">AI Reviews</th>
              <th className="px-4 py-3">Pipeline</th>
              <th className="px-4 py-3">Audit Logs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {roles.map((r) => (
              <tr key={r.role} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-[#0F172A] whitespace-nowrap">{r.role}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs">{r.desc}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{r.permissions.cases}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{r.permissions.entities}</td>
                <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">{r.permissions.reviews}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{r.permissions.pipeline}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{r.permissions.audit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
