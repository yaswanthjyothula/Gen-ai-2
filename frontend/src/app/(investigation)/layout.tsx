'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { InvestigationProvider } from '@/context/InvestigationContext';

export default function InvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InvestigationProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </InvestigationProvider>
  );
}
