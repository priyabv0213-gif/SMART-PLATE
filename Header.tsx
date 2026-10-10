import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Download,
  AlertTriangle,
  Radio,
  UserCheck,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCity,
    currentUser,
    events,
    executeAllocationRun,
    isSimulatedMode,
    setIsSimulatedMode,
  } = useApp();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert('To install SpoilClock PWA on desktop, click the Install icon in your browser URL bar. On Android/iOS, tap Share -> Add to Home Screen.');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    home: { title: 'SmartPlate Food Rescue', subtitle: 'Coimbatore Surplus Food Redistribution Network' },
    explore: { title: 'Explore Available Food', subtitle: 'Real-time verified surplus food catalog in Coimbatore' },
    donate: { title: 'Donate Surplus Food', subtitle: 'FSSAI compliant registration for restaurants & banquet halls' },
    request: { title: 'Request Food Aid', subtitle: 'Community kitchens, shelters & orphanages requirements' },
    activity: { title: 'My Activity & Tracking', subtitle: 'Personal donation milestones and delivery progress' },
    map: { title: 'Food Rescue Map', subtitle: 'OpenStreetMap Coimbatore dispatch with bundled pickups' },
    matching: { title: 'Smart Matching Engine', subtitle: 'Decay-rate prioritization, split allocations & explainability' },
    available: { title: 'Available Surplus Batches', subtitle: 'Real-time verified food catalog in Coimbatore' },
    allocation: { title: 'Smart Allocation Engine', subtitle: 'Decay-rate prioritization, split allocations & explainability' },
    routes: { title: 'Live Route Planning', subtitle: 'OpenStreetMap Coimbatore dispatch with bundled pickups' },
    operations: { title: 'Rescue Operations Deck', subtitle: 'Real-time delivery progress & disruption recovery' },
    impact: { title: 'Results & Community Impact', subtitle: 'Nourished people, avoided waste & carbon emissions' },
    demo: { title: 'Competition Demo Sandbox', subtitle: 'Self-contained scenario for hackathon judges' },
    advanced: { title: 'Advanced Engineering Tools', subtitle: 'Simulation lab, algorithm benchmark and FSSAI SOPs' },
    comparison: { title: 'Algorithm Comparison', subtitle: 'SmartPlate vs Nearest-First vs Static Window' },
    simulation: { title: 'Simulation Lab', subtitle: 'Predefined benchmark scenarios A through J' },
    recovery: { title: 'Recovery Management', subtitle: 'Circular animal feed, composting & biogas diversion' },
    analytics: { title: 'Technical Analytics', subtitle: 'Jain’s Fairness Index, km/meal & mathematical proofs' },
    settings: { title: 'Settings & Regulatory SOPs', subtitle: 'FSSAI compliance rules & urban routing configuration' },
  };

  const info = tabTitles[activeTab] || tabTitles.home;
  const unresolvedDisruptions = events.filter((e) => !e.resolved);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs sticky top-0 z-30">
      {/* Title */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
            {info.title}
          </h1>
          {unresolvedDisruptions.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {unresolvedDisruptions.length} Alert
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 truncate hidden sm:block">{info.subtitle}</p>
      </div>

      {/* Controls & Quick CTAs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* City tag */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{selectedCity}</span>
        </div>

        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            title="Install SpoilClock as an App (PWA)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Install App</span>
          </button>
        )}

        {/* Quick Launch Judge Demo Button */}
        {activeTab !== 'demo' && (
          <button
            onClick={() => setActiveTab('demo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden xs:inline">Judge Demo</span>
            <span className="xs:hidden">Demo</span>
          </button>
        )}

        {/* Quick Run Allocation button */}
        <button
          onClick={() => executeAllocationRun()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden sm:inline">Run Allocation</span>
          <span className="sm:hidden">Run</span>
        </button>
      </div>
    </header>
  );
};
