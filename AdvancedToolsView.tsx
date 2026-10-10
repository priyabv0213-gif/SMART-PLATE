import React, { useState } from 'react';
import {
  Layers,
  Sliders,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlgorithmComparisonView } from './AlgorithmComparisonView';
import { SimulationLabView } from './SimulationLabView';
import { RecoveryManagementView } from './RecoveryManagementView';
import { PerformanceAnalyticsView } from './PerformanceAnalyticsView';
import { SettingsView } from './SettingsView';

export const AdvancedToolsView: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [activeSubTool, setActiveSubTool] = useState<'comparison' | 'simulation' | 'recovery' | 'analytics' | 'settings'>('comparison');

  const tabs = [
    { id: 'comparison', label: 'Algorithm Benchmark', icon: Layers, desc: 'SmartPlate vs Baselines' },
    { id: 'simulation', label: 'Simulation Lab', icon: Sliders, desc: '10 Urban Scenarios' },
    { id: 'recovery', label: 'Circular Recovery', icon: RefreshCw, desc: 'Biogas & Feed Diversion' },
    { id: 'analytics', label: 'Fairness Metrics', icon: TrendingUp, desc: "Jain's Index & Emissions" },
    { id: 'settings', label: 'FSSAI SOPs', icon: ShieldCheck, desc: 'Safety Thresholds' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Operations & Research Deck
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Advanced Coordinator & Engineering Tools
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            In-depth simulation stress tests, mathematical baseline comparisons, circular economy diversion tracking, and FSSAI regulatory compliance rules.
          </p>
        </div>

        {/* Sub-tool tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-b border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeSubTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTool(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render selected tool */}
      <div>
        {activeSubTool === 'comparison' && <AlgorithmComparisonView />}
        {activeSubTool === 'simulation' && <SimulationLabView />}
        {activeSubTool === 'recovery' && <RecoveryManagementView />}
        {activeSubTool === 'analytics' && <PerformanceAnalyticsView />}
        {activeSubTool === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};
