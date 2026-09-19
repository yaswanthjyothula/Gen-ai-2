'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  Bell,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  FolderLock,
  Layers,
  CheckCircle2,
  FileText,
  Cpu
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';

export default function Header() {
  const router = useRouter();
  const {
    investigationId,
    caseId,
    setCaseId,
    activeCase,
    currentUser,
    pendingReviewCount
  } = useInvestigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCaseSelector, setShowCaseSelector] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/intelligence/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Brand Identity & Active Investigation Context */}
      <div className="flex items-center space-x-6">
        <Link href="/overview" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-md bg-[#0F172A] flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm">
            <Shield className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">CRIMENET</span>
            <span className="font-bold text-lg text-[#2563EB] tracking-tight">-X</span>
          </div>
        </Link>

        <div className="h-6 w-px bg-[#E2E8F0]" />

        {/* Global Investigation Context (Rule 3) */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1E40AF] font-medium border border-[#BFDBFE]">
            <FolderLock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-bold">{investigationId}</span>
            <span className="text-[#60A5FA]">•</span>
            <span className="font-semibold text-slate-700">CERBERUS</span>
          </div>

          {/* Case Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCaseSelector(!showCaseSelector)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-[#E2E8F0] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>{caseId}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showCaseSelector && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Active Case
                </div>
                <button
                  onClick={() => {
                    setCaseId('CASE-0147');
                    setShowCaseSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${caseId === 'CASE-0147' ? 'bg-[#EFF6FF] text-[#2563EB] font-bold' : 'text-slate-700'}`}
                >
                  <div>
                    <div className="font-bold">CASE-0147</div>
                    <div className="text-[11px] text-slate-500 truncate">Cerberus Core Distribution & Finance</div>
                  </div>
                  {caseId === 'CASE-0147' && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                </button>
                <button
                  onClick={() => {
                    setCaseId('CASE-0192');
                    setShowCaseSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${caseId === 'CASE-0192' ? 'bg-[#EFF6FF] text-[#2563EB] font-bold' : 'text-slate-700'}`}
                >
                  <div>
                    <div className="font-bold">CASE-0192</div>
                    <div className="text-[11px] text-slate-500 truncate">Port Authority Cargo Diversion & Heist</div>
                  </div>
                  {caseId === 'CASE-0192' && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                </button>
              </div>
            )}
          </div>

          <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            SECRET // NOFORN
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search targets, accounts, vehicles, phones, evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder-slate-400"
          />
        </div>
      </form>

      {/* Right: Review Queue Badge & User Persona */}
      <div className="flex items-center space-x-3">
        {/* Case AI Brain Copilot Badge */}
        <Link
          href="/intelligence/case-brain"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-xs font-bold transition-all shadow-2xs group"
          title="Open Case AI Brain (Google Gemini 3.6-Flash)"
        >
          <Cpu className="w-3.5 h-3.5 text-[#2563EB] group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Brain:</span>
          <span>{caseId === 'CASE-0147' ? 'CERBERUS-AML' : 'ODIN-Interdict'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        {/* Pending Review Queue Notification */}
        <Link
          href="/operations/review-queue"
          className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
          title="Pending AI Leads for Human Verification"
        >
          <Bell className="w-4 h-4" />
          {pendingReviewCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {pendingReviewCount}
            </span>
          )}
        </Link>

        <div className="h-6 w-px bg-[#E2E8F0]" />

        {/* User Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
            SV
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#0F172A] leading-tight">
              {currentUser?.full_name || 'Det. Insp. Sarah Vance'}
            </div>
            <div className="text-[10px] text-[#64748B] flex items-center space-x-1">
              <span className="font-semibold text-[#2563EB]">{currentUser?.role || 'Investigator'}</span>
              <span>•</span>
              <span>{currentUser?.badge_number || 'INV-4412'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
