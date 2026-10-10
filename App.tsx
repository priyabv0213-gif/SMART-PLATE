import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/views/HomeView';
import { ExploreFoodView } from './components/views/ExploreFoodView';
import { DonateFoodView } from './components/views/DonateFoodView';
import { RequestFoodView } from './components/views/RequestFoodView';
import { MyActivityView } from './components/views/MyActivityView';
import { RoutePlanningView } from './components/views/RoutePlanningView';
import { ResultsImpactView } from './components/views/ResultsImpactView';
import { SmartMatchingView } from './components/views/SmartMatchingView';
import { RescueOperationsView } from './components/views/RescueOperationsView';
import { AdvancedToolsView } from './components/views/AdvancedToolsView';
import { PublicDemoView } from './components/views/PublicDemoView';

// Subtools for direct tab access
import { AlgorithmComparisonView } from './components/views/AlgorithmComparisonView';
import { SimulationLabView } from './components/views/SimulationLabView';
import { RecoveryManagementView } from './components/views/RecoveryManagementView';
import { PerformanceAnalyticsView } from './components/views/PerformanceAnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { SmartPlateLogo } from './components/SmartPlateLogo';
import { Heart, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, selectedCity } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'explore':
      case 'available':
        return <ExploreFoodView />;
      case 'donate':
        return <DonateFoodView />;
      case 'request':
        return <RequestFoodView />;
      case 'activity':
        return <MyActivityView />;
      case 'map':
      case 'routes':
        return <RoutePlanningView />;
      case 'impact':
        return <ResultsImpactView />;
      case 'matching':
      case 'allocation':
        return <SmartMatchingView />;
      case 'operations':
        return <RescueOperationsView />;
      case 'advanced':
        return <AdvancedToolsView />;
      case 'demo':
        return <PublicDemoView />;

      // Direct fallback routes
      case 'comparison':
        return <AlgorithmComparisonView />;
      case 'simulation':
        return <SimulationLabView />;
      case 'recovery':
        return <RecoveryManagementView />;
      case 'analytics':
        return <PerformanceAnalyticsView />;
      case 'settings':
        return <SettingsView />;

      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans flex flex-col text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Primary Top Food-App Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-12">
        {renderActiveView()}
      </main>

      {/* Modern Consumer Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-10 mt-auto text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <SmartPlateLogo size={36} />
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Smart<span className="text-orange-500">Plate</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                <strong>Tagline:</strong> Good Food. Better Distribution. Less Waste.
                <br />
                SmartPlate connects surplus food with the right recipients and adapts distribution plans when circumstances change.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Microbiological Safety & FSSAI Standards Compliant</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Food Rescue
              </span>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setActiveTab('explore')} className="hover:text-orange-600 transition-colors">
                    Explore Available Food
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('donate')} className="hover:text-orange-600 transition-colors">
                    Donate Surplus Food
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('request')} className="hover:text-orange-600 transition-colors">
                    Request Food Aid
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('map')} className="hover:text-orange-600 transition-colors">
                    Food Rescue Map
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('impact')} className="hover:text-orange-600 transition-colors">
                    Community Impact
                  </button>
                </li>
              </ul>
            </div>

            {/* Platform & Evaluator */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Evaluation & Tech
              </span>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setActiveTab('demo')}
                    className="font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Try the Live Demo</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('matching')} className="hover:text-slate-900 transition-colors">
                    Smart Matching Engine
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('operations')} className="hover:text-slate-900 transition-colors">
                    Rescue Operations Deck
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('advanced')} className="hover:text-slate-900 transition-colors">
                    Advanced Engineering Tools
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demonstration Region: Coimbatore, Tamil Nadu, India</span>
            </div>
            <div className="text-slate-400">
              © {new Date().getFullYear()} SmartPlate Redistribution Network. Built with precision for sustainable urban food rescue.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
