import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MapPin,
  Download,
  Menu,
  X,
  ChevronDown,
  User,
  HeartHandshake,
  Utensils,
  Compass,
  History,
  Map as MapIcon,
  BarChart3,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  RefreshCw,
  TrendingUp,
  Radio,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { useApp, NavigationTab, UserRole } from '../context/AppContext';
import { SmartPlateLogo } from './SmartPlateLogo';
import { LocationSelectorModal } from './LocationSelectorModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCity,
    currentUser,
    switchUserRole,
    isOnline,
    events,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // PWA Install prompt listener
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
      alert(
        'To install SmartPlate PWA on desktop, click the Install icon in your browser URL bar. On mobile, tap Share -> Add to Home Screen.'
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  // Primary 4 Main Consumer Navigation Sections
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Utensils },
    { id: 'explore', label: 'Explore Food', icon: Compass },
    { id: 'donate', label: 'Donate', icon: HeartHandshake },
    { id: 'activity', label: 'My Activity', icon: History },
  ];

  // Secondary Tools under "More"
  const secondaryItems = [
    {
      id: 'map',
      label: 'Rescue Map',
      desc: 'Interactive food map & active pickups',
      icon: MapIcon,
    },
    {
      id: 'request',
      label: 'Request Food',
      desc: 'Register NGO demand & receiving capacity',
      icon: Utensils,
    },
    {
      id: 'impact',
      label: 'Community Impact',
      desc: 'Real meals saved, offset emissions & partner network',
      icon: BarChart3,
    },
  ];

  const advancedTools = [
    {
      id: 'operations',
      label: 'Rescue Operations',
      desc: 'Fleet coordination & active dispatches',
      icon: Radio,
    },
    {
      id: 'matching',
      label: 'Smart Matching Engine',
      desc: 'Algorithm rationale & plain-language matches',
      icon: Cpu,
    },
    {
      id: 'comparison',
      label: 'Algorithm Benchmark',
      desc: 'SmartPlate vs Nearest-First vs Static Window',
      icon: Layers,
    },
    {
      id: 'simulation',
      label: 'Simulation Lab',
      desc: '10 urban benchmark stress test scenarios',
      icon: Sliders,
    },
    {
      id: 'recovery',
      label: 'Circular Recovery',
      desc: 'Biogas, animal feed & composting diversion',
      icon: RefreshCw,
    },
    {
      id: 'analytics',
      label: 'Fairness & Metrics',
      desc: "Jain's index, emissions prevented & route efficiency",
      icon: TrendingUp,
    },
    {
      id: 'settings',
      label: 'FSSAI SOPs & Settings',
      desc: 'Regulatory microbial safety thresholds & city parameters',
      icon: ShieldCheck,
    },
  ];

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    donor: { label: 'Food Donor', badge: 'Restaurant / Hotel', color: 'bg-orange-100 text-orange-800' },
    ngo: { label: 'Recipient NGO', badge: 'Shelter / Kitchen', color: 'bg-emerald-100 text-emerald-800' },
    coordinator: { label: 'Rescue Coordinator', badge: 'City Dispatch', color: 'bg-blue-100 text-blue-800' },
    judge_demo: { label: 'Hackathon Evaluator', badge: 'Judge Demo Mode', color: 'bg-purple-100 text-purple-800' },
  };

  const isMoreActive = [
    'map',
    'routes',
    'request',
    'impact',
    'operations',
    'matching',
    'allocation',
    'comparison',
    'simulation',
    'recovery',
    'analytics',
    'settings',
    'advanced',
  ].includes(activeTab);

  const unresolvedDisruptions = events.filter((e) => !e.resolved);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Logo & Clickable Location Selector */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2.5 text-left group focus:outline-hidden"
              >
                <SmartPlateLogo size={40} />
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Smart<span className="text-orange-500">Plate</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-slate-400 -mt-1 hidden xs:block">
                    Food Rescue Network
                  </span>
                </div>
              </button>

              {/* Interactive India Location Selector Pill */}
              <button
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-orange-50/80 hover:border-orange-200 rounded-full text-xs font-semibold text-slate-700 hover:text-orange-700 border border-slate-200/80 transition-all cursor-pointer group"
                title="Change location across India"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:text-orange-600 shrink-0 transition-colors" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-orange-600 shrink-0 transition-transform" />
              </button>
            </div>

            {/* Middle: Desktop Main Navigation (4 Core Items + More Dropdown) */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'explore' && activeTab === 'available');
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavigationTab)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}

              {/* More / Advanced Dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isMoreActive
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  <span>More</span>
                  {unresolvedDisruptions.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">Food Rescue & Community</p>
                      <p className="text-[11px] text-slate-500">
                        Map overview, NGO requests & impact
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      {secondaryItems.map((item) => {
                        const isItemActive =
                          activeTab === item.id ||
                          (item.id === 'map' && activeTab === 'routes');
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as NavigationTab);
                              setMoreDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-start gap-2.5 transition-colors ${
                              isItemActive
                                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <item.icon
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                isItemActive ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{item.label}</div>
                              <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="px-3 py-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Technical Details & Tools
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab('advanced');
                            setMoreDropdownOpen(false);
                          }}
                          className="text-[10px] font-bold text-orange-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto pr-1">
                        {advancedTools.slice(0, 4).map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setActiveTab(tool.id as NavigationTab);
                              setMoreDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            <tool.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Quick CTAs, Live Demo, Role & Install */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Try Live Demo Button (Prominently Styled for Judges) */}
              <button
                onClick={() => setActiveTab('demo')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  activeTab === 'demo'
                    ? 'bg-orange-600 text-white shadow-orange-200'
                    : 'bg-linear-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-100 hover:scale-[1.02]'
                }`}
                title="Launch 100-meal Coimbatore Adaptive Reallocation Demonstration"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
                <span>Live Demo</span>
              </button>

              {/* Install PWA Button */}
              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                  title="Install SmartPlate PWA on your device"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>App</span>
                </button>
              )}

              {/* Role Switcher Menu */}
              <div className="relative" ref={roleMenuRef}>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
                  title="Switch current user role"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline-block max-w-[110px] truncate">
                    {roleLabels[currentUser.role]?.label || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Profile
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.organization}</p>
                    </div>
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role
                    </div>
                    {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchUserRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          currentUser.role === r
                            ? 'bg-slate-100 font-bold text-slate-900'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{roleLabels[r].label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleLabels[r].color}`}>
                          {roleLabels[r].badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg max-h-[80vh] overflow-y-auto">
            {/* Clickable Location Selector in Mobile Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                onClick={() => {
                  setLocationModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[180px]">{selectedCity}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Main Menu</p>
              {mainNavItems.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'explore' && activeTab === 'available');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as NavigationTab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Food Rescue Tools
              </p>
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as NavigationTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    activeTab === item.id
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setActiveTab('advanced');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Advanced Engineering Tools</span>
              </button>
            </div>

            {/* Quick Install in Mobile Drawer */}
            {!isInstalled && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleInstallClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Install SmartPlate App (PWA)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Swiggy / Zomato app feel on small screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Utensils },
          { id: 'explore', label: 'Explore', icon: Compass },
          { id: 'donate', label: 'Donate', icon: HeartHandshake },
          { id: 'activity', label: 'Activity', icon: History },
          { id: 'demo', label: 'Demo', icon: Sparkles, highlight: true },
        ].map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'explore' && activeTab === 'available');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavigationTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                tab.highlight
                  ? 'text-orange-600 font-bold'
                  : isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${
                  tab.highlight
                    ? 'text-orange-500'
                    : isActive
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
};
