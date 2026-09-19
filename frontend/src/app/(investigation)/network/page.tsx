'use client';

import React, { useEffect, useState } from 'react';
import { Network, Filter, Compass, Search, Eye, Share2, Layers, Cpu } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';
import NetworkGraph from '@/components/network/NetworkGraph';
import NodeDetailDrawer from '@/components/network/NodeDetailDrawer';
import TemporalSlider from '@/components/network/TemporalSlider';

export default function NetworkPage() {
  const { caseId } = useInvestigation();
  const [graphElements, setGraphElements] = useState<{ nodes: any[]; edges: any[]; statistics?: any }>({
    nodes: [],
    edges: [],
  });
  const [selectedElement, setSelectedElement] = useState<{ type: 'node' | 'edge'; data: any } | null>(null);
  const [sizeByCentrality, setSizeByCentrality] = useState(false);
  const [colorByCommunity, setColorByCommunity] = useState(false);
  const [highlightPath, setHighlightPath] = useState<string[] | null>(null);

  // Shortest path suspect selections
  const [sourceSuspect, setSourceSuspect] = useState<string>('ENT-101');
  const [targetSuspect, setTargetSuspect] = useState<string>('ENT-105');
  const [pathResult, setPathResult] = useState<any>(null);

  const [dateFilter, setDateFilter] = useState<{ dateFrom: string | null; dateTo: string | null }>({
    dateFrom: null,
    dateTo: null,
  });

  const loadGraph = async () => {
    try {
      const data = await api.getNetwork({
        case_id: caseId,
        date_from: dateFilter.dateFrom || undefined,
        date_to: dateFilter.dateTo || undefined,
      });
      setGraphElements(data);
    } catch (err) {
      console.error('Failed to load network graph:', err);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [caseId, dateFilter]);

  const handleComputeShortestPath = async () => {
    if (!sourceSuspect || !targetSuspect) return;
    try {
      const res = await api.getShortestPath(sourceSuspect, targetSuspect, caseId);
      setPathResult(res);
      if (res.path) {
        setHighlightPath(res.path);
      }
    } catch (err) {
      console.error('Failed to calculate shortest path:', err);
    }
  };

  const handleClearPath = () => {
    setHighlightPath(null);
    setPathResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>Investigation Context • {caseId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Network Intelligence Canvas
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Multi-modal dynamic graph powered by Cytoscape.js. Filter by time, inspect betweenness centrality, and detect community clusters.
          </p>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSizeByCentrality(!sizeByCentrality)}
            className={`px-3 py-1.5 rounded-md font-bold border transition-colors ${
              sizeByCentrality
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
            }`}
          >
            Centrality Sizing: {sizeByCentrality ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setColorByCommunity(!colorByCommunity)}
            className={`px-3 py-1.5 rounded-md font-bold border transition-colors ${
              colorByCommunity
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
            }`}
          >
            Louvain Colors: {colorByCommunity ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Temporal Timeline Slider (Section 21) */}
      <TemporalSlider onDateChange={(range) => setDateFilter(range)} />

      {/* Main Canvas Area */}
      <div className="relative">
        <NetworkGraph
          elements={graphElements}
          onSelectNode={(node) => setSelectedElement({ type: 'node', data: node })}
          onSelectEdge={(edge) => setSelectedElement({ type: 'edge', data: edge })}
          highlightPath={highlightPath}
          sizeByCentrality={sizeByCentrality}
          colorByCommunity={colorByCommunity}
        />

        {/* Slide-out Drawer */}
        <NodeDetailDrawer
          type={selectedElement?.type || null}
          data={selectedElement?.data || null}
          onClose={() => setSelectedElement(null)}
        />
      </div>

      {/* Analytical Tools Panel: Shortest Path & Intermediary Analysis */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-sm text-[#0F172A]">Shortest Path & Intermediary Entity Discovery</h3>
          </div>
          <span className="text-[11px] text-slate-500">Dijkstra Shortest Path Matrix</span>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-3 text-xs">
          <div className="flex-1 space-y-1">
            <label className="font-bold text-slate-700">Source Entity (Target A):</label>
            <select
              value={sourceSuspect}
              onChange={(e) => setSourceSuspect(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-md text-xs font-medium text-[#0F172A]"
            >
              {graphElements.nodes.map((n) => (
                <option key={n.data.id} value={n.data.id}>
                  {n.data.name || n.data.label} ({n.data.entity_type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label className="font-bold text-slate-700">Target Entity (Target B):</label>
            <select
              value={targetSuspect}
              onChange={(e) => setTargetSuspect(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-md text-xs font-medium text-[#0F172A]"
            >
              {graphElements.nodes.map((n) => (
                <option key={n.data.id} value={n.data.id}>
                  {n.data.name || n.data.label} ({n.data.entity_type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleComputeShortestPath}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-md shadow-xs transition-colors"
            >
              Find Shortest Chain
            </button>
            {highlightPath && (
              <button
                onClick={handleClearPath}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Path Result display */}
        {pathResult && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F172A]">
                Connection Chain Length: {pathResult.length} hops
              </span>
              <span className="text-[11px] text-slate-500">
                Intermediary Entities: {pathResult.intermediaries.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              {pathResult.path?.map((nodeId: string, idx: number) => {
                const nodeObj = graphElements.nodes.find((n) => n.data.id === nodeId);
                return (
                  <React.Fragment key={nodeId}>
                    <span className="px-2.5 py-1 rounded bg-white border border-[#E2E8F0] font-bold text-slate-800 shadow-2xs">
                      {nodeObj?.data.name || nodeId}
                    </span>
                    {idx < pathResult.path.length - 1 && (
                      <span className="text-red-500 font-bold">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
