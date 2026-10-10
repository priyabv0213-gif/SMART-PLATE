import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Info,
  Split,
  MapPin,
  TrendingUp,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SingleAssignment, RejectedAssignmentCandidate } from '../../types';

export const AllocationEngineView: React.FC = () => {
  const {
    currentPlan,
    comparisonPlans,
    selectedAlgorithm,
    setSelectedAlgorithm,
    objectiveWeights,
    setObjectiveWeights,
    executeAllocationRun,
    executeAllAlgorithmsComparison,
  } = useApp();

  const [selectedAssignment, setSelectedAssignment] = useState<SingleAssignment | null>(null);

  const handleSliderChange = (key: keyof typeof objectiveWeights, val: number) => {
    setObjectiveWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const plan = currentPlan;
  const assignments = plan?.assignments || [];
  const rejected = plan?.rejectedCandidates || [];
  const unallocated = plan?.unallocated || [];

  return (
    <div className="space-y-6">
      {/* Top Controls: Algorithm Selector & Coordinator Objective Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Algorithm Strategy Selector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Optimization Strategy
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Run time: {plan?.executionTimeMs || 0}ms
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <label
              onClick={() => {
                setSelectedAlgorithm('spoilclock-adaptive');
                executeAllocationRun('spoilclock-adaptive');
              }}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAlgorithm === 'spoilclock-adaptive'
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="algorithm"
                checked={selectedAlgorithm === 'spoilclock-adaptive'}
                onChange={() => {}}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  SmartPlate Adaptive Engine
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Decay-rate prioritization, split donation optimization, and dynamic multi-objective balancing.
                </p>
              </div>
            </label>

            <label
              onClick={() => {
                setSelectedAlgorithm('nearest-first');
                executeAllocationRun('nearest-first');
              }}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAlgorithm === 'nearest-first'
                  ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="algorithm"
                checked={selectedAlgorithm === 'nearest-first'}
                onChange={() => {}}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-bold text-slate-900">Nearest-First Baseline</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Greedily assigns to nearest recipient. Exposes risks of premature capacity saturation and unfairness.
                </p>
              </div>
            </label>

            <label
              onClick={() => {
                setSelectedAlgorithm('static-time-window');
                executeAllocationRun('static-time-window');
              }}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAlgorithm === 'static-time-window'
                  ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="algorithm"
                checked={selectedAlgorithm === 'static-time-window'}
                onChange={() => {}}
                className="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="font-bold text-slate-900">Static Time-Window Matching</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Greedy earliest-deadline matching without dynamic split allocations or disruption recalculation.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Objective Sliders & Pareto Weights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Coordinator Objective Priorities (Trade-off Weights)
              </h3>
              <p className="text-xs text-slate-500">
                Adjust relative optimization priorities. Safety and deadline feasibility remain non-negotiable hard constraints.
              </p>
            </div>

            <button
              onClick={() => executeAllocationRun()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply & Re-optimize</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            {/* Slider 1: Food Rescued */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Maximize Food Rescued</span>
                <span className="font-bold text-emerald-700">{Math.round(objectiveWeights.foodRescued * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={objectiveWeights.foodRescued}
                onChange={(e) => handleSliderChange('foodRescued', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Prioritizes gross meal units saved</span>
            </div>

            {/* Slider 2: Demand Satisfied */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Satisfy Recipient Demand</span>
                <span className="font-bold text-emerald-700">{Math.round(objectiveWeights.demandSatisfied * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={objectiveWeights.demandSatisfied}
                onChange={(e) => handleSliderChange('demandSatisfied', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Targets specific dietary quotas requested</span>
            </div>

            {/* Slider 3: Transport Distance */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Reduce Transport Distance & Fuel</span>
                <span className="font-bold text-emerald-700">
                  {Math.round(objectiveWeights.transportDistance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={objectiveWeights.transportDistance}
                onChange={(e) => handleSliderChange('transportDistance', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Penalizes long transit detours and fuel costs</span>
            </div>

            {/* Slider 4: Allocation Fairness */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Balance Fairness (Jain’s Index)</span>
                <span className="font-bold text-emerald-700">{Math.round(objectiveWeights.fairness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={objectiveWeights.fairness}
                onChange={(e) => handleSliderChange('fairness', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Ensures smaller shelters are not starved by large hubs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Allocation Plan Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Active Feasible Allocation Matches ({assignments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Click any row to inspect human-readable explainability and binding constraint proofs
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Summary:</span>
            <span className="font-bold text-emerald-600">{plan?.metrics.quantityAllocated} meals rescued</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{plan?.metrics.totalTransportKm} km</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Donor Batch</th>
                <th className="py-3 px-4">Selected Recipient</th>
                <th className="py-3 px-4">Assigned Quantity</th>
                <th className="py-3 px-4">Distance & Travel</th>
                <th className="py-3 px-4">Rescue Window & Margin</th>
                <th className="py-3 px-4">Feasibility Status</th>
                <th className="py-3 px-4 text-right">Explainability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No active assignments. Click "Run Allocation" above.
                  </td>
                </tr>
              ) : (
                assignments.map((asg) => {
                  const arrivalDate = new Date(asg.estimatedArrivalTime);
                  const completionDate = new Date(asg.estimatedCompletionTime);
                  const deadlineDate = new Date(asg.safeDeadline);

                  return (
                    <tr
                      key={asg.id}
                      onClick={() => setSelectedAssignment(asg)}
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                    >
                      {/* Donor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{asg.donorName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-slate-400">{asg.donationId}</span>
                          <span>•</span>
                          <span className="text-slate-700">{asg.foodCategory}</span>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{asg.recipientName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{asg.recipientId}</span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700 text-sm">{asg.allocatedQuantity} meals</span>
                          {asg.isSplit && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                              <Split className="w-3 h-3" /> Split #{asg.splitIndex}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Supply: {asg.originalSupplyQuantity} meals
                        </span>
                      </td>

                      {/* Distance & Travel */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{asg.distanceKm} km</div>
                        <div className="text-[11px] text-slate-500">~{asg.travelTimeMinutes} mins travel</div>
                      </td>

                      {/* Timeline */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-800">
                          Arrival:{' '}
                          <span className="font-semibold">
                            {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                          Safe buffer: +{asg.timeMarginMinutes} mins
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Deadline: {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Time-Feasible
                        </span>
                      </td>

                      {/* Explainability CTA */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssignment(asg);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <span>Why chosen?</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unallocated and Rejected Candidates Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unallocated Remainder */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-amber-500" />
            Unallocated Quantities & Diverted Batches ({unallocated.length})
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Batches where recipient capacity was saturated or safe window expired
          </p>

          <div className="space-y-2 text-xs">
            {unallocated.length === 0 ? (
              <p className="text-slate-400 italic">Zero unallocated batches — 100% surplus successfully redistributed!</p>
            ) : (
              unallocated.map((u, i) => (
                <div key={i} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{u.donorName}</span>
                    <span className="text-amber-800">{u.remainingQuantity} meals unallocated</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{u.reason}</p>
                  {u.candidateRecoveryRoute && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                      <span>Circular Route: Diverted to {u.candidateRecoveryRoute}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rejected Candidate Pairs (Why other recipients excluded) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Excluded Candidates & Binding Constraints ({rejected.length})
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Audit trail of pairs rejected by the Safety Gate before or during optimization
          </p>

          <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
            {rejected.length === 0 ? (
              <p className="text-slate-400 italic">No candidate rejections recorded.</p>
            ) : (
              rejected.map((r, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate">{r.recipientName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-red-100 text-red-800 shrink-0">
                      {r.bindingConstraint}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{r.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explainability Modal Dialog */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">ASSIGNMENT {selectedAssignment.id}</span>
                <h3 className="text-base font-bold text-slate-900">Allocation Decision & Feasibility Proof</h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Primary Selection Rationale
                </span>
                <p className="text-xs leading-relaxed text-emerald-900">{selectedAssignment.explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Safe Window Margin</span>
                  <span className="font-bold text-slate-900 text-sm">
                    +{selectedAssignment.timeMarginMinutes} minutes
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Travel Distance</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedAssignment.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Estimated Arrival</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedAssignment.estimatedArrivalTime).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Safe-Use Deadline</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedAssignment.safeDeadline).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Active Binding Constraints Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAssignment.bindingConstraints.map((bc, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                      ✓ {bc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
