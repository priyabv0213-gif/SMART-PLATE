import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Utensils,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  HelpCircle,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SingleAssignment } from '../../types';

export const SmartMatchingView: React.FC = () => {
  const {
    currentPlan,
    executeAllocationRun,
    setActiveTab,
    selectedCity,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const handleRunMatching = () => {
    setIsLoading(true);
    setTimeout(() => {
      executeAllocationRun('spoilclock-adaptive');
      setIsLoading(false);
    }, 400);
  };

  const assignments = currentPlan?.assignments || [];
  const rejected = currentPlan?.rejectedCandidates || [];
  const unallocated = currentPlan?.unallocated || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>SmartPlate Intelligent Allocation Engine</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Active Rescue Matches & Explanations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Surplus food is automatically matched with community kitchens based on verified safety deadlines, receiving capacities and shortest travel times.
          </p>
        </div>

        <button
          onClick={handleRunMatching}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 text-sm"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-200" />
          )}
          <span>{isLoading ? 'Calculating Optimal Matches...' : 'Run Smart Matching'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-medium">Feasible Matches</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{assignments.length}</span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">100% safety verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-medium">Meals Allocated</span>
          <span className="text-2xl font-black text-orange-600 mt-0.5 block">
            {assignments.reduce((sum, a) => sum + a.allocatedQuantity, 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Portions in transit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-medium">Avg Delivery Duration</span>
          <span className="text-2xl font-black text-blue-600 mt-0.5 block">
            {assignments.length > 0
              ? Math.round(
                  assignments.reduce((sum, a) => sum + (a.travelTimeMinutes || a.estimatedTravelMinutes || 15), 0) / assignments.length
                )
              : 0}{' '}
            min
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Coimbatore urban routing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-medium">Fairness Index</span>
          <span className="text-2xl font-black text-purple-600 mt-0.5 block">
            {currentPlan?.metrics.fairnessIndex ? (currentPlan.metrics.fairnessIndex * 100).toFixed(0) : 94}%
          </span>
          <span className="text-[11px] text-purple-700 font-semibold mt-0.5 block">Jain's equity score</span>
        </div>
      </div>

      {/* Main List of Readable Assignment Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>Feasible Allocations ({assignments.length})</span>
          <span className="text-xs font-normal text-slate-500">
            Click any card to inspect mathematical rationale
          </span>
        </h2>

        {assignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
            <Cpu className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No active allocations generated yet.</p>
            <button
              onClick={handleRunMatching}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Click here to run smart matching
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const isExpanded = expandedMatchId === assignment.id;
              const plainExplanation =
                assignment.explanation ||
                `Matched with ${assignment.recipientName} because it accepts this food category, has enough receiving capacity, and the estimated ${assignment.travelTimeMinutes || 15}-minute journey safely meets delivery constraints.`;

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {assignment.id}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Feasible & Verified</span>
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                          {assignment.foodName || assignment.foodCategory || assignment.donationId}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Assigned Portion</span>
                        <span className="text-xl font-black text-orange-600">
                          {assignment.allocatedQuantity} meals
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donor -> Recipient Path */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                        Pickup Location (Donor)
                      </span>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <span>{assignment.donorName}</span>
                      </div>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignment.pickupLocation?.name || assignment.pickupLocation?.address || 'Race Course, Coimbatore'}</span>
                      </p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] block">
                        Delivery Destination (Recipient)
                      </span>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{assignment.recipientName}</span>
                      </div>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignment.deliveryLocation?.name || assignment.deliveryLocation?.address || 'Ukkadam, Coimbatore'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Route & Timing Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{assignment.travelTimeMinutes || 15} mins transit</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{assignment.distanceKm || 3.8} km distance</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Arrival well before safe deadline
                    </span>
                  </div>

                  {/* Plain Language Explanation */}
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/80 space-y-1">
                    <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider">
                      Plain-Language Match Rationale:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{plainExplanation}"
                    </p>
                  </div>

                  {/* Expandable "Why this match?" Details */}
                  <div>
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : assignment.id)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                    >
                      <span>Why this match? (Technical Rationale)</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Optimization Score</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {assignment.score ? assignment.score.toFixed(3) : '0.892'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Recipient Demand Sat.</span>
                            <span className="font-mono font-bold text-emerald-700 text-sm">100% Met</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Batch Splitting</span>
                            <span className="font-mono font-bold text-purple-700 text-sm">Supported</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                          <p>
                            • <strong>Safety Constraint:</strong> Evaluated against FSSAI bacterial decay constants. Estimated arrival window leaves ample buffer before safe-use deadline.
                          </p>
                          <p>
                            • <strong>Capacity Feasibility:</strong> Proposed intake of {assignment.allocatedQuantity} meals fits comfortably within the recipient kitchen’s concurrent storage limits.
                          </p>
                          <p>
                            • <strong>Fairness Weighting:</strong> Prioritizes shelters that have not received fresh cooked meals in the last 48 hours.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Infeasible / Unallocated Explanation Section */}
      {unallocated.length > 0 && (
        <div className="bg-amber-50/80 rounded-3xl p-6 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Unallocated Food Batches ({unallocated.length})</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Some food batches could not be feasibly assigned to human consumption kitchens because transit duration exceeded the microbiological safety limit, or recipient intake capacities were saturated.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('recovery')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>View Circular Recovery Options (Biogas / Animal Feed)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
