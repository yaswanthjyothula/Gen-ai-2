'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Filter, ExternalLink, ShieldCheck, FileCheck2, Cpu, ArrowRight } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import { TimelineEvent } from '@/lib/types';

export default function TimelinePage() {
  const { caseId } = useInvestigation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [significanceFilter, setSignificanceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      setLoading(true);
      try {
        const data = await api.getTimeline({
          case_id: caseId,
          event_type: typeFilter || undefined,
          significance: significanceFilter || undefined,
        });
        setEvents(data);
      } catch (err) {
        console.error('Failed to load timeline events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, [caseId, typeFilter, significanceFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Temporal Chronology • Section 28</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Investigation Timeline
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Unified chronological feed tracing intercepts, wires, surveillance sightings, and AI detections back to source records.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Event Types (9)</option>
          <option value="Case Event">Case Event</option>
          <option value="Transaction">Transaction</option>
          <option value="Communication">Communication</option>
          <option value="Location">Location</option>
          <option value="Vehicle">Vehicle</option>
          <option value="AI Detection">AI Detection</option>
          <option value="Evidence">Evidence</option>
          <option value="Review Action">Review Action</option>
        </select>

        <select
          value={significanceFilter}
          onChange={(e) => setSignificanceFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-[#E2E8F0] rounded-md font-semibold text-slate-700"
        >
          <option value="">All Significance Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="ROUTINE">Routine</option>
        </select>
      </div>

      {/* Chronological Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Pin */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#2563EB] text-[#2563EB] flex items-center justify-center font-bold text-xs shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>

            {/* Event Box */}
            <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 hover:border-[#2563EB] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                    {evt.event_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.significance === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : evt.significance === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {evt.significance}
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-400">
                  {new Date(evt.timestamp).toLocaleString()}
                </div>
              </div>

              <h3 className="font-extrabold text-sm text-[#0F172A]">{evt.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{evt.summary}</p>

              {/* Source Provenance Link (Section 28) */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {evt.primary_entity_id && (
                    <Link
                      href={`/investigation/entities/${evt.primary_entity_id}`}
                      className="font-mono font-bold text-[#2563EB] hover:underline"
                    >
                      Target: {evt.primary_entity_id}
                    </Link>
                  )}
                  {evt.secondary_entity_id && (
                    <span className="font-mono text-slate-500">↔ {evt.secondary_entity_id}</span>
                  )}
                </div>

                {evt.evidence_id && (
                  <Link
                    href={`/evidence?evidence_id=${evt.evidence_id}`}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    <FileCheck2 className="w-3 h-3" />
                    <span>Evidence Record: {evt.evidence_id}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
