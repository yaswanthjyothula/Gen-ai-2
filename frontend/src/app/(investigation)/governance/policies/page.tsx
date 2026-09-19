'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, FileText } from 'lucide-react';

export default function GovernancePoliciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Governance & Legal Compliance Framework • Section 38</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Governance Policies
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Statutory data protection policies, model governance rules, and human oversight guarantees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">Strict Evidence Isolation (Rule 4)</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            AI findings exist exclusively as investigative leads. The system architecture strictly prohibits automated
            adjudication of guilt, criminal charging, or punitive action without sworn investigator concurrence.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">End-to-End Traceability (Rule 5)</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Every analytical inference must answer: WHAT was inferred? WHY was it surfaced? FROM WHERE did the records originate?
            WHEN was it detected? WHICH model version was deployed? WHAT is the confidence? and HAS a human verified it?
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">Data Anonymisation & Redaction</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Non-target PII captured tangentially in bulk telecom or customs feeds is automatically filtered and masked
            unless explicitly authorized under an active judicial search warrant.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-[#0F172A]">Model Explainability Guarantee</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Black-box neural networks without quantifiable signal attribution are barred from criminal network inference.
            All models must output transparent percentage weightings across network, temporal, and financial features.
          </p>
        </div>
      </div>
    </div>
  );
}
