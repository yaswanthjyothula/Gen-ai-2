'use client';

import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TemporalSliderProps {
  onDateChange: (range: { dateFrom: string | null; dateTo: string | null }) => void;
}

export default function TemporalSlider({ onDateChange }: TemporalSliderProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('all');
  const [sliderValue, setSliderValue] = useState<number>(100);

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    const now = new Date();
    let fromDate: Date | null = null;

    if (preset === '14d') {
      fromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      setSliderValue(20);
    } else if (preset === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setSliderValue(45);
    } else if (preset === '90d') {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      setSliderValue(80);
    } else {
      setSliderValue(100);
    }

    onDateChange({
      dateFrom: fromDate ? fromDate.toISOString() : null,
      dateTo: null,
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    setSelectedPreset('custom');

    const now = new Date();
    const daysAgo = Math.round((100 - val) * 0.9); // max 90 days
    if (daysAgo === 0) {
      onDateChange({ dateFrom: null, dateTo: null });
    } else {
      const fromDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      onDateChange({
        dateFrom: fromDate.toISOString(),
        dateTo: null,
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#2563EB]" />
          <h4 className="font-bold text-xs text-[#0F172A]">Temporal Network Evolution</h4>
          <span className="text-[11px] text-slate-500">• Filter connections across investigation timeline</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-1.5 text-xs">
          {[
            { id: '14d', label: 'Last 14d' },
            { id: '30d', label: 'Last 30d' },
            { id: '90d', label: 'Last 90d' },
            { id: 'all', label: 'All Time' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                selectedPreset === preset.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Range Slider */}
      <div className="space-y-1 pt-1">
        <input
          type="range"
          min="10"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full accent-[#2563EB] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400">
          <span>Day 1 (Warrant Execution)</span>
          <span>Day 30 (Wiretap Intercepts)</span>
          <span>Day 60 (ALPR Telemetry)</span>
          <span>Present Day (Active Dossier)</span>
        </div>
      </div>
    </div>
  );
}
