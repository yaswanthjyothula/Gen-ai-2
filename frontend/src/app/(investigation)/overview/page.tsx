'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GitFork,
  Boxes,
  Cpu,
  ListTodo,
  FileCheck2,
  Link2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  Network
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { AIFinding, TimelineEvent, Anomaly } from '@/lib/types';

export default function OverviewPage() {
  const { caseId, investigationId, activeCase } = useInvestigation();
  const [metrics, setMetrics] = useState({
    entities: 35,
    relationships: 28,
    communities: 4,
    aiCandidates: 3,
    pendingReviews: 2,
    evidence: 3,
    crossCaseLinks: 2,
  });
  const [aiFindings, setAiFindings] = useState<AIFinding[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [findingsData, timelineData, anomaliesData, entitiesData, relsData] = await Promise.all([
          api.getAIFindings(caseId),
          api.getTimeline({ case_id: caseId }),
          api.getAnomalies(caseId),
          api.getEntities({ case_id: caseId }),
          api.getRelationships({ case_id: caseId }),
        ]);
        setAiFindings(findingsData);
        setTimelineEvents(timelineData.slice(0, 5));
        setAnomalies(anomaliesData);
        setMetrics({
          entities: entitiesData.length,
          relationships: relsData.length,
          communities: 4,
          aiCandidates: findingsData.filter(f => f.status === 'UNVERIFIED').length,
          pendingReviews: findingsData.filter(f => f.status === 'UNVERIFIED').length,
          evidence: 3,
          crossCaseLinks: 2,
        });
      } catch (err) {
        console.error('Error loading overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  return (
    <div className="space-y-6">
      {/* Page Header (Page Contract) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Investigation Command Center</span>
            <span>•</span>
            <span className="text-slate-600">{investigationId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {activeCase?.title || 'Operation Cerberus - Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Continuous temporal network analytics, multi-signal AI leads, and evidentiary chain of custody.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/intelligence/workspace"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-md shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Cpu className="w-4 h-4" />
            <span>Open Workspace</span>
          </Link>
          <Link
            href="/operations/reports"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] text-xs font-bold rounded-md shadow-xs transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Intelligence Dossiers</span>
          </Link>
        </div>
      </div>

      {/* Clickable Metrics Dashboard (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Entities', val: metrics.entities, href: '/investigation/entities', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Relationships', val: metrics.relationships, href: '/investigation/relationships', icon: GitFork, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Communities', val: metrics.communities, href: '/investigation/communities', icon: Boxes, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'AI Candidates', val: metrics.aiCandidates, href: '/intelligence/ai-analysis', icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending Reviews', val: metrics.pendingReviews, href: '/operations/review-queue', icon: ListTodo, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Evidence Files', val: metrics.evidence, href: '/evidence', icon: FileCheck2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Cross-Case Links', val: metrics.crossCaseLinks, href: '/intelligence/cross-case', icon: Link2, color: 'text-slate-700', bg: 'bg-slate-100' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs hover:border-[#2563EB] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-md ${m.bg} ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
              </div>
              <div className="text-xl font-black text-[#0F172A]">{m.val}</div>
              <div className="text-[11px] font-semibold text-slate-500 truncate">{m.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: AI Finding Spotlight & Network Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: AI Leads Requiring Human Verification */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">AI Discovered Relationships (Decision-Support Leads)</h3>
              </div>
              <Link
                href="/intelligence/ai-analysis"
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
              >
                <span>View All AI Candidates</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {aiFindings.map((finding) => (
                <div key={finding.id} className="p-4 hover:bg-slate-50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500">{finding.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            finding.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {finding.status === 'VERIFIED' ? 'VERIFIED FINDING' : 'UNVERIFIED LEAD'}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500">{finding.model_name}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#0F172A]">{finding.title}</h4>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-semibold">Confidence</div>
                        <div className="text-lg font-black text-[#2563EB]">
                          {Math.round(finding.confidence * 100)}%
                        </div>
                      </div>
                      <Link
                        href={`/intelligence/workspace?finding_id=${finding.id}`}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <span>Inspect & Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {finding.explanation_text}
                  </p>

                  {/* Supporting Signals Decomposition (Section 25) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="font-bold text-slate-700">Supporting Signals:</span>
                    {finding.supporting_signals && Object.entries(finding.supporting_signals).map(([k, v]) => (
                      <div key={k} className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        <span>{k}:</span>
                        <span className="font-bold text-[#2563EB]">{Math.round(Number(v) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies Alert Box */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-[#0F172A]">Flagged Network Anomalies</h3>
              </div>
              <Link href="/intelligence/anomalies" className="text-xs font-bold text-[#2563EB] hover:underline">
                View All Anomalies →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomalies.slice(0, 2).map((anom) => (
                <div key={anom.id} className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-rose-700">{anom.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600 text-white">
                      {anom.severity}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-[#0F172A]">{anom.title}</h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{anom.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Network Visualizer Snapshot & Investigation Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Network Snapshot Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Network Topology</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">35 Targets</span>
            </div>

            <div className="h-44 bg-slate-900 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between text-white">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Louvain Partition</span>
                <span className="text-emerald-400 font-bold">4 Communities</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-blue-300">Central Target: Marcus Vance</div>
                <div className="text-[10px] text-slate-400">Betweenness Centrality: 0.820 (Rank #1)</div>
              </div>

              <Link
                href="/investigation/network"
                className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs text-center transition-colors block"
              >
                Open Full Cytoscape Graph Canvas
              </Link>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Recent Chronology</h3>
              </div>
              <Link href="/investigation/timeline" className="text-xs font-bold text-[#2563EB] hover:underline">
                Full Timeline →
              </Link>
            </div>

            <div className="space-y-3">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="text-xs border-l-2 border-[#2563EB] pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{new Date(evt.timestamp).toLocaleDateString()}</span>
                    <span className="font-semibold text-slate-600">{evt.event_type}</span>
                  </div>
                  <div className="font-bold text-[#0F172A]">{evt.title}</div>
                  <p className="text-[11px] text-[#64748B] line-clamp-2">{evt.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
