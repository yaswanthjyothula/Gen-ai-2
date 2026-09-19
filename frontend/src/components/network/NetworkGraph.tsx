'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';

interface NetworkGraphProps {
  elements: {
    nodes: Array<{ data: any }>;
    edges: Array<{ data: any }>;
  };
  onSelectNode?: (nodeData: any) => void;
  onSelectEdge?: (edgeData: any) => void;
  highlightPath?: string[] | null;
  sizeByCentrality?: boolean;
  colorByCommunity?: boolean;
}

const communityColors: Record<string, string> = {
  'COMM-01': '#2563EB', // Blue
  'COMM-02': '#D97706', // Amber
  'COMM-03': '#059669', // Emerald
  'COMM-04': '#7C3AED', // Violet
};

const entityTypeShapes: Record<string, any> = {
  Person: 'ellipse',
  Account: 'diamond',
  Phone: 'round-rectangle',
  Vehicle: 'hexagon',
  Location: 'tag',
  Organisation: 'rectangle',
  Device: 'barrel',
  Case: 'star',
};

export default function NetworkGraph({
  elements,
  onSelectNode,
  onSelectEdge,
  highlightPath,
  sizeByCentrality = false,
  colorByCommunity = false,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...elements.nodes.map((n) => ({
          group: 'nodes' as const,
          data: {
            ...n.data,
            label: n.data.name || n.data.label,
          },
        })),
        ...elements.edges.map((e) => ({
          group: 'edges' as const,
          data: {
            ...e.data,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'font-family': 'Inter, sans-serif',
            'font-size': '11px',
            'font-weight': 600,
            'color': '#0F172A',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'background-color': (ele: any) => {
              if (colorByCommunity && ele.data('community_id')) {
                return communityColors[ele.data('community_id')] || '#64748B';
              }
              const type = ele.data('entity_type');
              if (type === 'Person') return '#2563EB';
              if (type === 'Account') return '#D97706';
              if (type === 'Phone') return '#4F46E5';
              if (type === 'Vehicle') return '#7C3AED';
              if (type === 'Location') return '#059669';
              if (type === 'Organisation') return '#0F172A';
              if (type === 'Device') return '#0891B2';
              return '#475569';
            },
            'shape': (ele: any) => entityTypeShapes[ele.data('entity_type')] || 'ellipse',
            'width': (ele: any) => {
              if (sizeByCentrality) {
                const bet = ele.data('betweenness_centrality') || 0.1;
                return Math.max(30, Math.min(70, 30 + bet * 50));
              }
              return 36;
            },
            'height': (ele: any) => {
              if (sizeByCentrality) {
                const bet = ele.data('betweenness_centrality') || 0.1;
                return Math.max(30, Math.min(70, 30 + bet * 50));
              }
              return 36;
            },
            'border-width': 2,
            'border-color': '#FFFFFF',
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': (ele: any) => Math.min(5, Math.max(1.5, ele.data('weight') || 1.5)),
            'line-color': (ele: any) => {
              const rel = ele.data('relationship_type');
              const status = ele.data('verification_status');
              if (status === 'AI_UNVERIFIED') return '#F59E0B'; // Amber for unverified AI lead
              if (rel === 'Financial') return '#10B981';
              if (rel === 'Communication') return '#3B82F6';
              if (rel === 'Ownership') return '#0F172A';
              return '#94A3B8';
            },
            'line-style': (ele: any) => {
              const status = ele.data('verification_status');
              if (status === 'AI_UNVERIFIED') return 'dashed';
              return 'solid';
            },
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#94A3B8',
            'arrow-scale': 0.8,
            'font-size': '9px',
            'font-family': 'Inter, sans-serif',
            'label': 'data(label)',
            'text-rotation': 'autorotate',
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#F59E0B',
            'background-color': '#D97706',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4,
            'line-color': '#F59E0B',
            'target-arrow-color': '#F59E0B',
          },
        },
        {
          selector: '.path-highlight',
          style: {
            'line-color': '#EF4444',
            'target-arrow-color': '#EF4444',
            'width': 4.5,
            'z-index': 999,
          },
        },
        {
          selector: '.node-path-highlight',
          style: {
            'border-color': '#EF4444',
            'border-width': 5,
            'z-index': 999,
          },
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        randomize: false,
        componentSpacing: 100,
        nodeOverlap: 20,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      setSelectedItem({ type: 'node', data: node.data() });
      if (onSelectNode) onSelectNode(node.data());
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      setSelectedItem({ type: 'edge', data: edge.data() });
      if (onSelectEdge) onSelectEdge(edge.data());
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedItem(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [elements]);

  // Handle path highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('path-highlight node-path-highlight dimmed');

    if (highlightPath && highlightPath.length > 1) {
      cy.elements().addClass('dimmed');

      for (let i = 0; i < highlightPath.length; i++) {
        const nodeId = highlightPath[i];
        cy.$(`node[id = "${nodeId}"]`).removeClass('dimmed').addClass('node-path-highlight');

        if (i < highlightPath.length - 1) {
          const nextNodeId = highlightPath[i + 1];
          cy.edges().forEach((edge) => {
            const src = edge.data('source');
            const tgt = edge.data('target');
            if (
              (src === nodeId && tgt === nextNodeId) ||
              (src === nextNodeId && tgt === nodeId)
            ) {
              edge.removeClass('dimmed').addClass('path-highlight');
            }
          });
        }
      }
    }
  }, [highlightPath]);

  // Controls
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleResetLayout = () => {
    cyRef.current?.layout({ name: 'cose', animate: true }).run();
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-50 border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-1.5 bg-white p-1.5 rounded-lg border border-[#E2E8F0] shadow-sm z-10 text-xs">
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <div className="h-px bg-[#E2E8F0]" />
        <button
          onClick={handleFit}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 text-[10px] font-bold transition-colors"
          title="Fit All"
        >
          FIT
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 text-[10px] font-bold transition-colors"
          title="Recalculate Layout"
        >
          RE-LAYOUT
        </button>
      </div>

      {/* Legend Badge Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] p-3 rounded-lg shadow-sm text-[11px] space-y-1.5 z-10">
        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Graph Legend</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span>Person</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#D97706] rotate-45" />
            <span>Account</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4F46E5]" />
            <span>Phone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#7C3AED]" />
            <span>Vehicle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]" />
            <span>Location</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#0F172A]" />
            <span>Organisation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
