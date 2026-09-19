'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, ExternalLink, Filter } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const { caseId } = useInvestigation();

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const res = await api.search(term, caseId);
      setResults(res.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) {
      performSearch(initialQ);
    }
  }, [initialQ, caseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Global Intelligence Search • Section 42</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Universal Search Index
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Federated queries across targets, shell accounts, burner IMSIs, vehicles, evidence manifests, and AI findings.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search suspects, burner phones, license plates, IBANs, or warrant numbers..."
          className="w-full pl-12 pr-28 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] shadow-xs text-[#0F172A]"
        />
        <button
          type="submit"
          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Searching global intelligence index...</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 px-1">
              Found {results.length} indexed records matching &ldquo;{query}&rdquo;
            </div>
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.route}
                className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-all flex items-center justify-between group block"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {item.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{item.id}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">{item.subtitle}</div>
                </div>

                <div className="flex items-center space-x-2 text-slate-400 group-hover:text-[#2563EB] transition-colors">
                  <span className="text-xs font-bold hidden sm:inline">Open Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-[#E2E8F0]">
            No records matched query &ldquo;{query}&rdquo;.
          </div>
        ) : null}
      </div>
    </div>
  );
}
