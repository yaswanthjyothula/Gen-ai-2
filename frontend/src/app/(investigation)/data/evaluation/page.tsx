'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, ShieldCheck, Cpu, Clock, Layers } from 'lucide-react';
import { api } from '@/lib/api';

export default function EvaluationDashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await api.getEvaluationDashboard();
        setReport(data);
      } catch (err) {
        console.error('Failed to load evaluation report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  if (loading || !report) {
    return <div className="p-12 text-center text-slate-400">Loading evaluation benchmarks...</div>;
  }

  const { link_prediction, community_detection, anomaly_detection, operational_impact, robustness_stress_tests } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <span>AI Model Benchmarking & Statistical Validation • Section 37</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Scientific Evaluation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Comparative performance metrics against classical baselines and operational time savings analysis.
          </p>
        </div>
      </div>

      {/* Operational Impact Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#60A5FA] uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Operational Investigation Efficiency Metric</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-400">Traditional Investigation Hours</div>
            <div className="text-2xl font-black">{operational_impact.traditional_investigation_hours} hrs</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">CRIMENET-X Platform Hours</div>
            <div className="text-2xl font-black text-[#60A5FA]">{operational_impact.crimenet_platform_hours} hrs</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Net Investigator Hours Saved</div>
            <div className="text-2xl font-black text-emerald-400">{operational_impact.time_saved_hours} hrs</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Time Reduction %</div>
            <div className="text-3xl font-black text-emerald-400">
              {operational_impact.investigation_time_saved_percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparisons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Link Prediction */}
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="font-extrabold text-sm text-[#0F172A]">Link Prediction</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {link_prediction.f1_improvement} vs Baseline
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Precision:</span>
              <strong className="text-slate-800">{link_prediction.precision}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Recall:</span>
              <strong className="text-slate-800">{link_prediction.recall}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">F1 Score:</span>
              <strong className="text-[#2563EB]">{link_prediction.f1_score}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Precision@K:</span>
              <strong className="text-slate-800">{link_prediction.precision_at_k}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">PR-AUC:</span>
              <strong className="text-slate-800">{link_prediction.pr_auc}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1">
            Baseline: {link_prediction.baseline_model} (F1: {link_prediction.baseline_f1})
          </div>
        </div>

        {/* Community Detection */}
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="font-extrabold text-sm text-[#0F172A]">Community Detection</h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Louvain Method
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Modularity (Q):</span>
              <strong className="text-[#2563EB]">{community_detection.modularity_q}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">NMI:</span>
              <strong className="text-slate-800">{community_detection.normalized_mutual_info_nmi}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Adjusted Rand (ARI):</span>
              <strong className="text-slate-800">{community_detection.adjusted_rand_index_ari}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Ground Truth Recovery:</span>
              <strong className="text-emerald-600 font-bold">{community_detection.ground_truth_clusters_identified}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1">
            Ground Truth: Synthetic Cerberus Tactical Cell Structure
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="font-extrabold text-sm text-[#0F172A]">Anomaly Detection</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {anomaly_detection.fpr_reduction} FPR
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Precision:</span>
              <strong className="text-slate-800">{anomaly_detection.precision}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Recall:</span>
              <strong className="text-slate-800">{anomaly_detection.recall}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">F1 Score:</span>
              <strong className="text-[#2563EB]">{anomaly_detection.f1_score}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">False Positive Rate:</span>
              <strong className="text-emerald-600 font-bold">{anomaly_detection.false_positive_rate}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1">
            Baseline FPR: {anomaly_detection.baseline_fpr} (Z-Score 3-Sigma)
          </div>
        </div>
      </div>

      {/* Robustness & Stress Tests Matrix (Section 37) */}
      <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wider">
          Adversarial Robustness & Noise Stress Tests
        </h3>

        <div className="divide-y divide-[#E2E8F0]">
          {robustness_stress_tests.map((test: any, idx: number) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="font-bold text-[#0F172A]">{test.test_scenario}</div>
              <div className="flex items-center space-x-4 font-mono">
                <span className="text-slate-600">
                  Resilience: <strong>{test.graceful_f1_degradation || test.false_positive_resilience || test.resolution_accuracy || test.future_leak_rate || test['re-identification_rate']}</strong>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {test.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
