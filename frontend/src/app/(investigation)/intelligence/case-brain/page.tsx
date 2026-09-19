'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Sparkles,
  Send,
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  Layers,
  Fingerprint,
  RefreshCw,
  Terminal,
  Activity,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  SplitSquareVertical,
  Cpu
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { api } from '@/lib/api';

interface CaseProfile {
  case_id: string;
  case_title: string;
  persona_code: string;
  persona_name: string;
  specialization: string;
  analytical_posture: string;
  threat_signature: string;
  behavioral_directives: string[];
  evidentiary_thresholds: Record<string, any>;
  key_inquiries: string[];
  model_version: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  personaCode?: string;
  referencedEntities?: string[];
  referencedEvidence?: string[];
  suggestedLeads?: string[];
  modelUsed?: string;
  latencyMs?: number;
}

interface Hypothesis {
  id: string;
  title: string;
  rationale: string;
  confidence_score: number;
  target_entities: string[];
  required_evidence_to_verify: string[];
  recommended_warrants_or_subpoenas: string[];
}

export default function CaseBrainPage() {
  const { caseId, setCaseId } = useInvestigation();
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [brainStatus, setBrainStatus] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loadingHypotheses, setLoadingHypotheses] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'hypotheses' | 'directives'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Brain Status and Case Profile
  useEffect(() => {
    async function loadData() {
      setInitialLoading(true);
      try {
        const [statusData, profileData] = await Promise.all([
          api.getBrainStatus().catch(() => null),
          api.getCaseBrainProfile(caseId).catch(() => null)
        ]);
        setBrainStatus(statusData);
        setProfile(profileData);

        // Seed initial greeting message from the Case Brain
        if (profileData) {
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: `**CRIMENET-X CASE BRAIN ONLINE**\n\nI am **${profileData.persona_name}** (${profileData.persona_code}), uniquely assigned to **${profileData.case_title}**.\n\n*Specialization:* ${profileData.specialization}\n\n*Operational Stance:* ${profileData.analytical_posture}\n\nI am grounded in catalogued case entities, financial ledgers, CDR telephony, and surveillance logs. How shall we direct our investigative inquiries?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              personaCode: profileData.persona_code,
              suggestedLeads: profileData.behavioral_directives.slice(0, 3),
              modelUsed: profileData.model_version
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load Case Brain data:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.chatWithCaseBrain(caseId, query, history);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personaCode: res.persona_code,
        referencedEntities: res.referenced_entities,
        referencedEvidence: res.referenced_evidence,
        suggestedLeads: res.suggested_next_leads,
        modelUsed: res.model_used,
        latencyMs: res.latency_ms
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error connecting to Case Brain: ${err?.message || 'Unknown network error'}. Fallback cognitive engine engaged.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personaCode: profile?.persona_code || 'BRAIN-ERROR'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHypotheses = async () => {
    setLoadingHypotheses(true);
    setActiveTab('hypotheses');
    try {
      const res = await api.getCaseHypotheses(caseId);
      setHypotheses(res);
    } catch (err) {
      console.error('Failed to generate hypotheses:', err);
    } finally {
      setLoadingHypotheses(false);
    }
  };

  // Helper to render text with markdown bolding and clickable Entity/Evidence badges
  const renderFormattedText = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      // Check for bullet lists
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n');
        return (
          <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
            {items.map((item, iIdx) => (
              <li key={iIdx}>{formatInlineTokens(item.replace(/^[-*]\s+/, ''))}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="my-2 leading-relaxed">
          {formatInlineTokens(paragraph)}
        </p>
      );
    });
  };

  const formatInlineTokens = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`ENT-\d+`|`EV-\d+`|ENT-\d+|EV-\d+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-[#0F172A]">{part.slice(2, -2)}</strong>;
      }
      const entMatch = part.match(/\b(ENT-\d+)\b/);
      if (entMatch) {
        const entId = entMatch[1];
        return (
          <Link
            key={idx}
            href={`/entities/${entId}`}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-sm bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-mono text-xs font-bold border border-blue-200 transition-colors"
          >
            {entId}
          </Link>
        );
      }
      const evMatch = part.match(/\b(EV-\d+)\b/);
      if (evMatch) {
        const evId = evMatch[1];
        return (
          <Link
            key={idx}
            href="/evidence"
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-sm bg-amber-50 text-amber-700 hover:bg-amber-100 font-mono text-xs font-bold border border-amber-200 transition-colors"
          >
            {evId}
          </Link>
        );
      }
      return part;
    });
  };

  const quickPrompts = caseId === 'CASE-0147' ? [
    { label: 'Marcus Vance & BlueWater Trust', query: 'What evidence connects Marcus Vance (ENT-101) to BlueWater Capital Trust (ENT-106) and nominal director Sarah Jenkins (ENT-105)?' },
    { label: 'Unmask Nominee Layering', query: 'Analyze the shell company directorship layering in Zurich and Grand Cayman. Which corporate accounts show smurfing patterns?' },
    { label: 'Correlate Anomaly ANOM-301', query: 'How does the +480% wire surge on BlueWater Capital Trust correlate with the Rotterdam courier interception?' },
    { label: 'Recommend Subpoenas & Warrants', query: 'Recommend the top 3 priority subpoenas or MLAT requests needed to freeze syndicate assets before capital flight occurs.' }
  ] : [
    { label: 'Antwerp Port Logistics Nexus', query: 'Analyze the container shipping vulnerabilities in CASE-0192 and the connection to freight forwarders.' },
    { label: 'Vessel AIS Transponder Gaps', query: 'Which maritime container discharge manifests correlate with burner IMEI communications near port terminal gates?' },
    { label: 'Armored Vehicle Tracking', query: 'Assess the physical movements of vehicle ENT-114 tracked between London and maritime entry corridors.' },
    { label: 'Tactical Interdiction Window', query: 'What is the immediate perishable physical window for container inspection at the terminal?' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-[#2563EB]" />
            <span>Case AI Brain • Google Gemini 3.6-Flash Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
            Case Intelligence Copilot
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
              {profile?.persona_code || 'SYNTHESIZING...'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            The AI Brain alters its behavioral persona, analytical stance, and directives dynamically for every case.
          </p>
        </div>

        {/* Case Switcher & Brain Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg p-1 shadow-2xs text-xs font-medium">
            <span className="px-2.5 py-1 text-slate-500 font-bold">Active Case:</span>
            <button
              onClick={() => setCaseId('CASE-0147')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                caseId === 'CASE-0147'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              CASE-0147 (CERBERUS)
            </button>
            <button
              onClick={() => setCaseId('CASE-0192')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                caseId === 'CASE-0192'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              CASE-0192 (ODIN)
            </button>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 3.6 Online</span>
          </div>
        </div>
      </div>

      {/* Case Cognitive Profile Header Card */}
      {profile && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold">
                  {profile.persona_code}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                  {profile.case_title}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {profile.persona_name}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-blue-300">Operational Stance: </strong>
                {profile.analytical_posture}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  <span className="text-slate-400">Threat Signature: </span>
                  <strong className="text-white">{profile.threat_signature}</strong>
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={handleGenerateHypotheses}
                disabled={loadingHypotheses}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loadingHypotheses ? 'Synthesizing...' : 'Generate Case Hypotheses'}
              </button>

              <Link
                href={`/network`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Inspect Case Network Graph
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Interactive Interrogation Console
        </button>

        <button
          onClick={() => {
            setActiveTab('hypotheses');
            if (hypotheses.length === 0) handleGenerateHypotheses();
          }}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hypotheses'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Case Hypotheses ({hypotheses.length})
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directives'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Behavioral Directives & Thresholds
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col h-[650px]">
            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-2xs text-slate-400 font-bold uppercase">
                    {m.role === 'user' ? (
                      <span>Investigator Sarah Vance</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#2563EB]">
                        <BrainCircuit className="w-3 h-3" />
                        {m.personaCode || 'Case Brain'}
                        {m.latencyMs && <span className="text-slate-400">({m.latencyMs}ms)</span>}
                      </span>
                    )}
                    <span>• {m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] rounded-xl p-4 text-xs shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-[#2563EB] text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 border border-[#E2E8F0] rounded-tl-none'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-800 leading-relaxed">
                          {renderFormattedText(m.content)}
                        </div>

                        {/* Suggested Leads Chips */}
                        {m.suggestedLeads && m.suggestedLeads.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="text-2xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-amber-500" />
                              Suggested Follow-up Leads:
                            </div>
                            <div className="space-y-1.5">
                              {m.suggestedLeads.map((lead, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendMessage(`Investigate lead: ${lead}`)}
                                  className="w-full text-left px-2.5 py-1.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-2xs font-medium text-slate-700 transition-all flex items-center justify-between group"
                                >
                                  <span>{lead}</span>
                                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#2563EB]" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 px-1 text-2xs text-[#2563EB] font-bold uppercase">
                    <BrainCircuit className="w-3 h-3 animate-spin" />
                    <span>Gemini 3.6-Flash Reasoning...</span>
                  </div>
                  <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 rounded-tl-none text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Analyzing graph topologies, financial structuring vectors, and evidence items...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-[#E2E8F0] flex items-center gap-2 overflow-x-auto">
              <span className="text-2xs font-bold text-slate-400 uppercase shrink-0">Quick Queries:</span>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-2xs font-medium text-slate-700 whitespace-nowrap transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask ${profile?.persona_name || 'Case Brain'} about suspects, offshore accounts, or evidence...`}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-xs focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <span>Transmit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Case Focus & Key Inquiries */}
          <div className="space-y-4">
            {/* Key Inquiries Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0F172A]">
                <FileSearch className="w-4 h-4 text-[#2563EB]" />
                <span>Priority Case Inquiries</span>
              </div>
              <p className="text-2xs text-[#64748B]">
                Core questions formulated by the Gemini Brain for this specific investigation.
              </p>
              <div className="space-y-2">
                {profile?.key_inquiries.map((inq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(inq)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 font-medium transition-all group"
                  >
                    <div className="text-2xs font-bold text-[#2563EB] mb-1">Inquiry #{idx + 1}</div>
                    <div className="leading-snug">{inq}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evidentiary Thresholds */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0F172A]">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Case Evidentiary Rules</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Documentary Standard:</span>
                  <span className="font-bold text-slate-800">
                    {profile?.evidentiary_thresholds?.documentary_threshold || 'CERTIFIED_RECORD'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Temporal Window:</span>
                  <span className="font-bold text-slate-800">
                    {profile?.evidentiary_thresholds?.temporal_correlation_window_hours || 48} Hours
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Minimum Corroborations:</span>
                  <span className="font-bold text-[#2563EB]">
                    {profile?.evidentiary_thresholds?.minimum_unmasking_signals || 3} Independent Signals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Hypotheses Tab */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Actionable hypotheses synthesized by the Gemini Brain based on real graph topologies, evidence ledgers, and behavioral anomalies.
            </p>
            <button
              onClick={handleGenerateHypotheses}
              disabled={loadingHypotheses}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHypotheses ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hypotheses.map((hyp) => (
              <div
                key={hyp.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#2563EB] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-mono font-bold">
                      {hyp.id}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {Math.round(hyp.confidence_score * 100)}% Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                    {hyp.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hyp.rationale}
                  </p>

                  {/* Target Entities */}
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase">Target Entities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hyp.target_entities.map((eid) => (
                        <Link
                          key={eid}
                          href={`/entities/${eid}`}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-[#2563EB] rounded text-2xs font-mono font-bold transition-colors"
                        >
                          {eid}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Required Evidence */}
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-slate-400 uppercase">Required Evidence to Verify:</span>
                    <ul className="text-2xs text-slate-600 space-y-1 pl-4 list-disc">
                      {hyp.required_evidence_to_verify.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Warrants */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-2xs font-bold text-amber-600 uppercase">Recommended Actions:</span>
                  <div className="mt-1 space-y-1">
                    {hyp.recommended_warrants_or_subpoenas.map((act, idx) => (
                      <div key={idx} className="text-2xs text-slate-700 flex items-center gap-1.5 font-medium">
                        <ChevronRight className="w-3 h-3 text-[#2563EB] shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Directives Tab */}
      {activeTab === 'directives' && profile && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Operational Directives for {profile.persona_code}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              These rules are injected into every reasoning pass of the Gemini Brain to ensure analysis strictly matches the legal and tactical parameters of {profile.case_title}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.behavioral_directives.map((dir, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {dir}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <strong>Responsible AI Principle:</strong> The Gemini Brain acts exclusively as an investigative decision-support tool. It assists human investigators in connecting disparate evidentiary dots and drafting warrant justifications. It never renders automated legal verdicts or indictments.
          </div>
        </div>
      )}
    </div>
  );
}
