'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Network,
  GitFork,
  Boxes,
  Clock,
  Cpu,
  Flame,
  Link2,
  Workflow,
  Search,
  BrainCircuit,
  FileCheck2,
  GitCommit,
  Database,
  Award,
  ListTodo,
  FileSpreadsheet,
  FolderKanban,
  Server,
  Terminal,
  UserCheck2,
  Microchip,
  BarChart3,
  History,
  ShieldAlert,
  Lock,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { pendingReviewCount } = useInvestigation();

  const navigation: NavSection[] = [
    {
      section: 'INVESTIGATION',
      items: [
        { title: 'Overview', href: '/overview', icon: LayoutDashboard },
        { title: 'Cases', href: '/cases', icon: Briefcase },
        { title: 'Entities', href: '/entities', icon: Users },
        { title: 'Network', href: '/network', icon: Network },
        { title: 'Relationships', href: '/relationships', icon: GitFork },
        { title: 'Communities', href: '/communities', icon: Boxes },
        { title: 'Timeline', href: '/timeline', icon: Clock },
      ],
    },
    {
      section: 'INTELLIGENCE',
      items: [
        { title: 'Case AI Brain', href: '/intelligence/case-brain', icon: BrainCircuit, badge: 'Gemini' },
        { title: 'AI Analysis', href: '/intelligence/ai-analysis', icon: Cpu },
        { title: 'Anomalies', href: '/intelligence/anomalies', icon: Flame, badge: '3' },
        { title: 'Cross-Case Links', href: '/intelligence/cross-case', icon: Link2 },
        { title: 'Investigation Workspace', href: '/intelligence/workspace', icon: Workflow },
        { title: 'Search', href: '/intelligence/search', icon: Search },
      ],
    },
    {
      section: 'EVIDENCE',
      items: [
        { title: 'Evidence', href: '/evidence', icon: FileCheck2 },
        { title: 'Evidence Chain', href: '/evidence/chain', icon: GitCommit },
        { title: 'Source Records', href: '/evidence/sources', icon: Database },
        { title: 'Findings', href: '/evidence/findings', icon: Award },
      ],
    },
    {
      section: 'OPERATIONS',
      items: [
        {
          title: 'Review Queue',
          href: '/operations/review-queue',
          icon: ListTodo,
          badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
        },
        { title: 'Reports', href: '/operations/reports', icon: FileSpreadsheet },
        { title: 'Case Management', href: '/operations/cases', icon: FolderKanban },
      ],
    },
    {
      section: 'DATA & AI',
      items: [
        { title: 'Data Sources', href: '/data/sources', icon: Server },
        { title: 'Data Pipeline', href: '/data/pipeline', icon: Terminal },
        { title: 'Entity Resolution', href: '/data/entity-resolution', icon: UserCheck2 },
        { title: 'Model Center', href: '/data/model-center', icon: Microchip },
        { title: 'Evaluation', href: '/data/evaluation', icon: BarChart3 },
      ],
    },
    {
      section: 'GOVERNANCE',
      items: [
        { title: 'Audit Log', href: '/governance/audit', icon: History },
        { title: 'Governance', href: '/governance/policies', icon: ShieldAlert },
        { title: 'Access Control', href: '/governance/access-control', icon: Lock },
        { title: 'Data Retention', href: '/governance/retention', icon: Archive },
      ],
    },
    {
      section: 'SYSTEM',
      items: [
        { title: 'Settings', href: '/system/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`h-[calc(100vh-4rem)] bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-200 sticky top-16 z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.section} className="space-y-1">
            {!collapsed && (
              <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.section}
              </h2>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={collapsed ? item.title : undefined}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-semibold text-slate-400">CRIMENET-X v1.0</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
