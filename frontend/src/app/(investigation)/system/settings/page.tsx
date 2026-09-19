'use client';

import React from 'react';
import { Settings, Shield, Server, Database, UserCheck, Terminal } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';

export default function SettingsPage() {
  const { investigationId, caseId, currentUser } = useInvestigation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            System Settings & Status
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Runtime environment parameters, database connectivity, and active persona credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Status */}
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3">
            <Server className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">Runtime Environment</h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Platform Version:</span>
              <strong className="text-slate-800">CRIMENET-X v1.0.0-Enterprise</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Backend API Status:</span>
              <strong className="text-emerald-600">ONLINE (Port 8000)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Relational DB Engine:</span>
              <strong className="text-slate-800">SQLAlchemy 2.0 (Dual-Mode SQLite / Postgres)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Graph Analytics Engine:</span>
              <strong className="text-slate-800">NetworkX Dynamic Multigraph (In-Memory)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Graph Visualizer:</span>
              <strong className="text-slate-800">Cytoscape.js v3.30+</strong>
            </div>
          </div>
        </div>

        {/* Investigator Persona */}
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">Active Session Persona</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Investigating Officer:</span>
              <strong className="text-slate-800">{currentUser?.full_name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Assigned Role:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2563EB]">
                {currentUser?.role}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Badge ID:</span>
              <strong className="font-mono text-slate-800">{currentUser?.badge_number}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Division:</span>
              <strong className="text-slate-800">{currentUser?.department}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Active Docket:</span>
              <strong className="font-mono text-slate-800">{investigationId} / {caseId}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
