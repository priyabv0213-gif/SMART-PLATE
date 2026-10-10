import React, { useState } from 'react';
import {
  Home,
  UtensilsCrossed,
  HandHeart,
  Package,
  Cpu,
  MapPin,
  Radio,
  Award,
  Sparkles,
  FlaskConical,
  Recycle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { useApp, NavigationTab, UserRole } from '../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const {
    activeTab,
    setActiveTab,
    donations,
    events,
    currentUser,
    switchUserRole,
  } = useApp();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const availableCount = donations.filter((d) => d.status === 'Available').length;
  const unresolvedEventsCount = events.filter((e) => !e.resolved).length;

  const primaryItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'donate', label: 'Donate Food', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'request', label: 'Request Food', icon: <HandHeart className="w-4 h-4" /> },
    { id: 'available', label: 'Available Surplus', icon: <Package className="w-4 h-4" />, badge: availableCount },
    { id: 'allocation', label: 'Smart Allocation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'routes', label: 'Route Map', icon: <MapPin className="w-4 h-4" /> },
    {
      id: 'operations',
      label: 'Live Operations',
      icon: <Radio className="w-4 h-4" />,
      badge: unresolvedEventsCount > 0 ? unresolvedEventsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'impact', label: 'Results & Impact', icon: <Award className="w-4 h-4" /> },
    { id: 'demo', label: 'Interactive Demo', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badgeColor: 'bg-purple-600 text-white' },
  ];

  const advancedItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'comparison', label: 'Algorithm Comparison', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'simulation', label: 'Simulation Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'recovery', label: 'Recovery Mgmt', icon: <Recycle className="w-4 h-4" /> },
    { id: 'analytics', label: 'Technical Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & SOPs', icon: <Settings className="w-4 h-4" /> },
  ];

  const rolesList: { id: UserRole; label: string; org: string }[] = [
    { id: 'judge_demo', label: 'Evaluation Judge', org: 'Hackathon Committee' },
    { id: 'donor', label: 'Annapoorna Kitchen', org: 'Restaurant Donor' },
    { id: 'ngo', label: 'No Food Waste', org: 'Recipient NGO' },
    { id: 'coordinator', label: 'City Operations', org: 'SpoilClock Dispatch' },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between bg-slate-950">
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                SpoilClock
                <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CBE
                </span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Adaptive Food Rescue</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1 relative">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 text-xs transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="truncate text-left">
                <span className="font-bold text-white block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 truncate block">{currentUser.organization}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          {showRoleMenu && (
            <div className="absolute top-12 left-3 right-3 bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-1.5 z-40 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                Switch Perspective:
              </span>
              {rolesList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchUserRole(r.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                    currentUser.role === r.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className="font-medium truncate">{r.label}</span>
                  <span className="text-[10px] text-slate-400 truncate ml-1">{r.org}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Links Area */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {/* Primary Workflow Items */}
        {!collapsed && (
          <span className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 block pb-1">
            Food Rescue Workflow
          </span>
        )}

        {primaryItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Secondary / Advanced Section */}
        <div className="pt-3">
          {!collapsed ? (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Advanced Optimization Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="border-t border-slate-800 my-2" />
          )}

          {(showAdvanced || collapsed) && (
            <div className="space-y-0.5 pt-1">
              {advancedItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left group ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="shrink-0">{item.icon}</div>
                    {!collapsed && <span className="truncate text-[11px]">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
