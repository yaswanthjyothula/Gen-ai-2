'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Case, Investigation } from '@/lib/types';
import { api } from '@/lib/api';

interface InvestigationContextType {
  investigationId: string;
  setInvestigationId: (id: string) => void;
  caseId: string;
  setCaseId: (id: string) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  activeCase: Case | null;
  activeInvestigation: Investigation | null;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  pendingReviewCount: number;
  refreshReviewCount: () => void;
  isLoading: boolean;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: React.ReactNode }) {
  const [investigationId, setInvestigationId] = useState<string>('INV-2026-0147');
  const [caseId, setCaseId] = useState<string>('CASE-0147');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('ENT-101');
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'USR-002',
    username: 'svance',
    email: 'svance@crimenetx.gov',
    full_name: 'Det. Insp. Sarah Vance',
    role: 'Investigator',
    badge_number: 'INV-4412',
    department: 'Transnational Organised Crime Division'
  });
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshReviewCount = async () => {
    try {
      const queue = await api.getReviewQueue(caseId);
      setPendingReviewCount(queue.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    async function loadContext() {
      setIsLoading(true);
      try {
        const invData = await api.getInvestigation(investigationId);
        setActiveInvestigation(invData);
        const caseData = await api.getCase(caseId);
        setActiveCase(caseData);
        await refreshReviewCount();
      } catch (err) {
        console.warn('Could not load initial investigation context, using default cache:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContext();
  }, [investigationId, caseId]);

  return (
    <InvestigationContext.Provider
      value={{
        investigationId,
        setInvestigationId,
        caseId,
        setCaseId,
        selectedEntityId,
        setSelectedEntityId,
        activeCase,
        activeInvestigation,
        currentUser,
        setCurrentUser,
        pendingReviewCount,
        refreshReviewCount,
        isLoading
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const ctx = useContext(InvestigationContext);
  if (!ctx) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return ctx;
}
