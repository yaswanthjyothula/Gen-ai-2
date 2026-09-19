'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield,
  Network,
  Cpu,
  Boxes,
  Clock,
  Link2,
  FileCheck2,
  Flame,
  Binary,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Database,
  Lock,
  Eye,
  FileText
} from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated network particle visualization in the hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Nodes
    const numNodes = 28;
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: i === 0 ? 8 : (i < 4 ? 6 : 4),
      isCentral: i === 0,
      isCellLead: i > 0 && i < 4,
      color: i === 0 ? '#2563EB' : (i < 4 ? '#0F172A' : '#64748B'),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 20 || node.x > width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > height - 20) node.vy *= -1;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = 1 - dist / 130;
            ctx.strokeStyle = (nodes[i].isCentral || nodes[j].isCentral)
              ? `rgba(37, 99, 235, ${alpha * 0.6})`
              : `rgba(203, 213, 225, ${alpha * 0.5})`;
            ctx.lineWidth = (nodes[i].isCentral || nodes[j].isCentral) ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (node.isCentral) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar */}
      <nav className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-[#0F172A] flex items-center justify-center text-white">
              <Shield className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#0F172A]">CRIMENET</span>
              <span className="font-bold text-lg text-[#2563EB]">-X</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#problem" className="hover:text-[#2563EB] transition-colors">Problem</a>
            <a href="#solution" className="hover:text-[#2563EB] transition-colors">Solution</a>
            <a href="#capabilities" className="hover:text-[#2563EB] transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">Architecture</a>
            <a href="#responsible-ai" className="hover:text-[#2563EB] transition-colors">Responsible AI</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/overview"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-md shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
              Understand complex criminal networks through{' '}
              <span className="text-[#2563EB]">explainable graph intelligence.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl">
              Transform authorised investigative records into an interactive, temporal network of
              entities, relationships, communities, and anomalies. Designed strictly for human
              investigators with full evidence provenance and zero autonomous guilt decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/overview"
                className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold rounded-md shadow-md transition-all flex items-center space-x-2"
              >
                <span>Explore Platform</span>
                <ChevronRight className="w-4 h-4 text-[#2563EB]" />
              </Link>
              <a
                href="#capabilities"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] text-sm font-bold rounded-md shadow-xs transition-all"
              >
                View Capabilities
              </a>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-6 border-t border-[#E2E8F0] text-left">
              <div>
                <div className="text-2xl font-black text-[#0F172A]">68%</div>
                <div className="text-xs font-medium text-slate-500">Investigation Time Saved</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#2563EB]">100%</div>
                <div className="text-xs font-medium text-slate-500">Evidence Provenance Trace</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A]">Human</div>
                <div className="text-xs font-medium text-slate-500">In-The-Loop Verification</div>
              </div>
            </div>
          </div>

          {/* Hero Network Visualizer */}
          <div className="lg:col-span-5 relative">
            <div className="w-full h-88 sm:h-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px] text-slate-300">INV-2026-0147 • LIVE GRAPH ENGINE</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                  Louvain Modularity Q=0.81
                </span>
              </div>
              <div className="flex-1 relative">
                <canvas ref={canvasRef} className="w-full h-full block" />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 p-2.5 rounded text-[11px] text-slate-300 flex items-center justify-between font-mono">
                  <span>Target: Marcus Vance (High Centrality)</span>
                  <span className="text-amber-400 font-semibold">Lead: FIND-901 (84%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <h2 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">The Investigative Challenge</h2>
          <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Complex syndicated crime hides inside fragmented datasets.
          </h3>
          <p className="text-sm text-[#64748B]">
            Human investigators are overwhelmed by thousands of disparate bank statements, burner phone CDRs,
            corporate filings, and surveillance logs. Disconnected spreadsheets make it impossible to see the hidden
            bridges, laundering conduits, and cross-case links.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              01
            </div>
            <h4 className="font-bold text-base text-[#0F172A]">Information Silos</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Phone records sit in telecom spreadsheets, financial wires stay in bank ledgers, and vehicle sightings
              are buried in patrol incident reports without unified identity resolution.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              02
            </div>
            <h4 className="font-bold text-base text-[#0F172A]">Layered Obfuscation</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Transnational networks deliberately employ nominee directors, offshore fiduciary trusts, and multi-hop
              burner communications to fragment direct evidence links.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              03
            </div>
            <h4 className="font-bold text-base text-[#0F172A]">Black-Box AI Risks</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Opaque neural networks that output unsubstantiated guilt claims cannot withstand scrutiny in a court of
              law and violate foundational due process guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#60A5FA] uppercase">The Platform Solution</span>
            <h2 className="text-3xl font-black tracking-tight">
              An explainable graph intelligence engine built around human verification.
            </h2>
            <p className="text-sm text-slate-300">
              CRIMENET-X continuously unifies authorized investigative records into a temporal multigraph,
              extracts structural patterns, discovers candidate links, and provides clear evidentiary rationale
              before an investigator makes any decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <Network className="w-6 h-6 text-[#60A5FA]" />
              <h4 className="font-bold text-sm">Dynamic Multigraph</h4>
              <p className="text-xs text-slate-400">
                Nodes represent people, shell companies, burner phones, bank accounts, and vehicles, connected by
                temporal multi-type edges.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <Cpu className="w-6 h-6 text-[#60A5FA]" />
              <h4 className="font-bold text-sm">Graph AI & Link Prediction</h4>
              <p className="text-xs text-slate-400">
                Machine learning infers hidden connections and candidate intermediary brokers using topological
                similarity and activity spikes.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <FileCheck2 className="w-6 h-6 text-[#60A5FA]" />
              <h4 className="font-bold text-sm">Strict Provenance Lineage</h4>
              <p className="text-xs text-slate-400">
                Every inference links directly back through extracted records to certified subpoena warrants and SHA-256
                hashes.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <CheckCircle className="w-6 h-6 text-[#60A5FA]" />
              <h4 className="font-bold text-sm">Mandatory Human Review</h4>
              <p className="text-xs text-slate-400">
                Leads remain strictly unverified until certified investigators verify or reject them with documented
                reason codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid (Section 10) */}
      <section id="capabilities" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <h2 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">Platform Capabilities</h2>
          <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Comprehensive Analytical Modules
          </h3>
          <p className="text-sm text-[#64748B]">
            Eight core intelligence capabilities designed for criminal network analysis and legal compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Network Intelligence',
              icon: Network,
              desc: 'Cytoscape.js interactive canvas with degree, betweenness, and closeness centrality analysis.',
            },
            {
              title: 'AI Relationship Discovery',
              icon: Cpu,
              desc: 'Link prediction models uncovering concealed nominee controllers and hidden conduits.',
            },
            {
              title: 'Community Detection',
              icon: Boxes,
              desc: 'Louvain modularity clustering isolating operational command, laundering cells, and logistics.',
            },
            {
              title: 'Temporal Analysis',
              icon: Clock,
              desc: 'Interactive timeline slider examining how connections strengthen, surge, or disappear.',
            },
            {
              title: 'Cross-Case Intelligence',
              icon: Link2,
              desc: 'Discover authorized shared vehicles, shell entities, and phone hardware across distinct cases.',
            },
            {
              title: 'Evidence Provenance',
              icon: FileCheck2,
              desc: 'Complete unbroken audit trail from raw source document through entity to final finding.',
            },
            {
              title: 'Anomaly Detection',
              icon: Flame,
              desc: 'Isolation Forest identifying communication bursts and sub-$10K structured financial cycling.',
            },
            {
              title: 'Explainable AI',
              icon: Binary,
              desc: 'Transparent signal percentage breakdowns explaining exactly why each candidate relationship was surfaced.',
            },
          ].map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] transition-colors space-y-3"
              >
                <div className="w-9 h-9 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#0F172A]">{cap.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline (Section 10) */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">Architecture & Methodology</h2>
            <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">How CRIMENET-X Works</h3>
            <p className="text-sm text-[#64748B]">
              Rigorous data engineering, graph AI, and governance workflow ensuring integrity at every transformation stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3 text-center">
            {[
              { step: '1', title: 'Authorised Data', subtitle: 'Subpoenas & CDRs' },
              { step: '2', title: 'Processing', subtitle: 'Schema & Hygiene' },
              { step: '3', title: 'Entity Resolution', subtitle: 'Multi-Signal Match' },
              { step: '4', title: 'Relations', subtitle: 'NLP & Direct Links' },
              { step: '5', title: 'Dynamic Graph', subtitle: 'Temporal Topology' },
              { step: '6', title: 'AI Analysis', subtitle: 'Link Prediction' },
              { step: '7', title: 'Evidence', subtitle: 'Provenance Link' },
              { step: '8', title: 'Human Review', subtitle: 'Investigator Review' },
              { step: '9', title: 'Verified Finding', subtitle: 'Court Dossier' },
            ].map((s, idx) => (
              <div key={s.step} className="p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs space-y-1 relative">
                <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-[11px] font-bold mx-auto flex items-center justify-center">
                  {s.step}
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{s.title}</div>
                <div className="text-[10px] text-[#64748B]">{s.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible AI Principles (Rule 4 & 5, Section 10) */}
      <section id="responsible-ai" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">Responsible AI Framework</h2>
          <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Strict Ethical & Legal Principles
          </h3>
          <p className="text-sm text-[#64748B]">
            CRIMENET-X operates as a decision-support system. It never makes autonomous determinations of guilt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              title: 'Explainable',
              desc: 'Every link prediction provides quantifiable signal breakdowns (network, temporal, financial, location).',
            },
            {
              title: 'Evidence-Based',
              desc: 'No AI output exists in isolation; each connects to primary subpoena records and cryptographic hashes.',
            },
            {
              title: 'Human Verified',
              desc: 'Leads only become findings upon affirmative human investigator review and documentation.',
            },
            {
              title: 'Auditable',
              desc: 'Immutable audit logs record every query, data inspection, model run, and verification decision.',
            },
            {
              title: 'Access Controlled',
              desc: 'Strict role-based access control enforces least privilege across investigators, analysts, and auditors.',
            },
          ].map((principle) => (
            <div key={principle.title} className="p-5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs space-y-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-[#0F172A]">{principle.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{principle.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-[#0F172A] text-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to explore Operation CERBERUS?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Launch the investigation command center, explore the live Cytoscape.js network, inspect unverified AI
            leads, and examine the complete evidence chain.
          </p>
          <div>
            <Link
              href="/overview"
              className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-md shadow-lg transition-all inline-flex items-center space-x-2"
            >
              <span>Enter Investigation Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-8 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <span className="font-bold text-[#0F172A]">CRIMENET-X</span>
            <span>• AI Criminal Network Intelligence Platform</span>
          </div>
          <div>
            Law Enforcement Decision-Support System • Built in accordance with Responsible AI Guidelines
          </div>
        </div>
      </footer>
    </div>
  );
}
