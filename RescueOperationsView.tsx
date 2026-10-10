import React from 'react';
import {
  Radio,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  Utensils,
  MapPin,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RescueOperationsView: React.FC = () => {
  const {
    donations,
    recipients,
    currentPlan,
    events,
    executeAllocationRun,
    setActiveTab,
    markDeliveryCompleted,
  } = useApp();

  // Strict calculations
  const availableDonations = donations.filter(
    (d) => d.status === 'Available' || d.status === 'Allocated'
  );

  const assignments = currentPlan?.assignments || [];

  // Strictly differentiate assigned vs delivered
  const assignedMeals = assignments
    .filter((a) => a.status !== 'Delivered')
    .reduce((sum, a) => sum + a.allocatedQuantity, 0);

  const deliveredMeals = assignments
    .filter((a) => a.status === 'Delivered')
    .reduce((sum, a) => sum + a.allocatedQuantity, 0);

  const unresolvedDisruptions = events.filter((e) => !e.resolved);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>SmartPlate Live Dispatch Deck</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Rescue Operations Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Coordinating real-time surplus food rescues, vehicle journeys and rapid disruption interventions across Coimbatore.
          </p>
        </div>

        {/* Dual Actions: Run Matching & Try Disruption Demo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => executeAllocationRun('spoilclock-adaptive')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-transform hover:scale-[1.02] shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Run Smart Matching</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-transform hover:scale-[1.02] shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-200" />
            <span>Try Disruption Demo</span>
          </button>
        </div>
      </div>

      {/* 4 Core Calculated KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Available Donations</span>
            <Utensils className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 mt-2 block">
            {availableDonations.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {availableDonations.reduce((sum, d) => sum + d.quantity, 0)} portions ready
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Meals Currently Assigned</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-3xl font-black text-blue-600 mt-2 block">
            {assignedMeals}
          </span>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
            In active transit
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Deliveries Requiring Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-600 mt-2 block">
            {unresolvedDisruptions.length}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Active disruptions
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Meals Recorded Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 mt-2 block">
            {deliveredMeals}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Verified intake confirmed
          </span>
        </div>
      </div>

      {/* Main Grid: Active Allocations & Recipient Kitchens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Allocation Plan & Disruptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Allocations List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Current Allocation Plan</h2>
                <p className="text-xs text-slate-500">Live matched routes with arrival estimates</p>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active assignments. Run matching to generate a dispatch plan.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">{a.id}</span>
                        <span className="font-bold text-slate-900">{a.allocatedQuantity} meals</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {a.status}
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-2">
                        <span>{a.donorName}</span>
                        <span className="text-slate-300">➔</span>
                        <span className="font-semibold text-slate-800">{a.recipientName}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{a.explanation}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-slate-500 font-semibold">{a.travelTimeMinutes || a.estimatedTravelMinutes || 15} mins ETA</span>
                      {a.status !== 'Delivered' && (
                        <button
                          onClick={() => markDeliveryCompleted(a.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Disruptions / Issues */}
          {unresolvedDisruptions.length > 0 && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Active Delivery Alerts ({unresolvedDisruptions.length})</span>
              </div>
              <div className="space-y-2">
                {unresolvedDisruptions.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{(ev.type || (ev as any).eventType || 'Event').replace('_', ' ')}: </span>
                      <span className="text-slate-600">{ev.description}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('demo')}
                      className="px-3 py-1 bg-orange-500 text-white font-bold rounded-lg text-[11px]"
                    >
                      Resolve via Reallocation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Recipient Organizations & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Partner Kitchens</h2>
              <span className="text-xs text-slate-400">{recipients.length} active</span>
            </div>

            <div className="space-y-3">
              {recipients.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Capacity: {r.maxReceivingCapacity}
                    </span>
                  </div>
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.location.name || r.location.address}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Demand: {r.demandQuantity} meals</span>
                    <span className="text-slate-600 font-semibold">{r.operatingHours.open} - {r.operatingHours.close}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Link to Advanced Engineering Tools */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm">Advanced Engineering Tools</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access the mathematical benchmark comparison, 10 simulation test scenarios, circular bio-recovery, and FSSAI SOPs.
            </p>
            <button
              onClick={() => setActiveTab('comparison')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors text-center"
            >
              Open Advanced Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
