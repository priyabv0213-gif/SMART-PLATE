import React, { useState } from 'react';
import {
  Radio,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SingleAssignment } from '../../types';

export const LiveOperationsView: React.FC = () => {
  const {
    currentPlan,
    vehicles,
    recipients,
    events,
    triggerDisruption,
    markDeliveryCompleted,
    isSimulatedMode,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const assignments = currentPlan?.assignments || [];

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    if (activeFilter === 'At risk') return a.timeMarginMinutes < 45 && a.status !== 'Delivered';
    if (activeFilter === 'Awaiting pickup') return a.status === 'Scheduled';
    if (activeFilter === 'In transit') return a.status === 'In Transit' || a.status === 'Pickup En Route';
    if (activeFilter === 'Delivered') return a.status === 'Delivered';
    return true;
  });

  // Action helpers to simulate events
  const handleSimulateCancellation = () => {
    const targetRecipient = recipients.find((r) => r.active);
    if (!targetRecipient) return;

    triggerDisruption({
      type: 'recipient_cancellation',
      title: `${targetRecipient.name} Emergency Cancellation`,
      description: `Recipient reported an unexpected facility intake freeze (equipment maintenance). Reallocating all pending surplus batches.`,
      targetId: targetRecipient.id,
      severity: 'high',
    });
  };

  const handleSimulateVehicleBreakdown = () => {
    const targetVehicle = vehicles.find((v) => v.status !== 'Broken Down');
    if (!targetVehicle) return;

    triggerDisruption({
      type: 'vehicle_breakdown',
      title: `${targetVehicle.name} Mechanical Breakdown`,
      description: `Vehicle suffered flat tire and engine cooling alert. Routes immediately re-dispatched to backup courier.`,
      targetId: targetVehicle.id,
      severity: 'high',
    });
  };

  const handleSimulateTrafficDelay = () => {
    const targetAssignment = assignments.find((a) => a.status !== 'Delivered');
    if (!targetAssignment) return;

    triggerDisruption({
      type: 'delivery_delay',
      title: `Heavy Expressway Gridlock Alert (+40 min delay)`,
      description: `Severe road closure on Manhattan FDR Drive affecting delivery ${targetAssignment.id}. Re-verifying deadline safety margins.`,
      targetId: targetAssignment.id,
      severity: 'medium',
    });
  };

  const latestEventWithDiff = events.find((e) => e.reallocationDiff);

  return (
    <div className="space-y-6">
      {/* Simulation / Disruption Trigger Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Event-Driven Recalculation Engine
              </span>
              <span className="text-xs text-slate-400">({isSimulatedMode ? 'Simulated' : 'Real-time'})</span>
            </div>
            <h2 className="text-lg font-bold text-white">Interactive Disruption Simulator & Operations Deck</h2>
            <p className="text-xs text-slate-300">
              Test how SmartPlate autonomously senses disruptions, preserves completed deliveries, and reallocates surplus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateCancellation}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Recipient Cancellation</span>
            </button>

            <button
              onClick={handleSimulateVehicleBreakdown}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-red-400" />
              <span>Simulate Vehicle Breakdown</span>
            </button>

            <button
              onClick={handleSimulateTrafficDelay}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate 40m Traffic Delay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reallocation Diff Audit Alert (if recent disruption occurred) */}
      {latestEventWithDiff?.reallocationDiff && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Adaptive Reallocation Executed: {latestEventWithDiff.title}
                </span>
                <span className="text-[11px] font-mono text-emerald-700">
                  {new Date(latestEventWithDiff.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed font-medium">
                {latestEventWithDiff.reallocationDiff.explanation}
              </p>
              <div className="flex items-center gap-4 pt-1 font-semibold text-emerald-800 text-[11px]">
                <span>✓ Preserved Deliveries: {latestEventWithDiff.reallocationDiff.preservedDeliveriesCount}</span>
                <span>✓ Reassigned Meals: {latestEventWithDiff.reallocationDiff.reallocatedMealsCount}</span>
                {latestEventWithDiff.reallocationDiff.unrecoverableMealsDelta > 0 && (
                  <span className="text-red-700">
                    ⚠ Diverted to Circular Recovery: {latestEventWithDiff.reallocationDiff.unrecoverableMealsDelta}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1">Filter Missions:</span>
          {['All', 'At risk', 'Awaiting pickup', 'In transit', 'Delivered'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="text-slate-500 text-xs">
          Showing <span className="font-bold text-slate-900">{filteredAssignments.length}</span> active missions
        </div>
      </div>

      {/* Active Missions Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No delivery missions match current filter.
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const isDelivered = asg.status === 'Delivered';
            const isAtRisk = asg.timeMarginMinutes < 45 && !isDelivered;

            return (
              <div
                key={asg.id}
                className={`bg-white rounded-xl border p-4.5 space-y-3 transition-all shadow-2xs relative ${
                  isAtRisk ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block">{asg.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{asg.donorName}</h3>
                    <p className="text-xs text-slate-500">{asg.foodCategory}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAtRisk
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isDelivered ? 'DELIVERED' : isAtRisk ? 'AT RISK' : asg.status.toUpperCase()}
                  </span>
                </div>

                {/* Trajectory visualization: Donor -> Recipient */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="max-w-[45%]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
                    <span className="font-semibold text-slate-800 truncate block">{asg.donorName}</span>
                    <span className="text-[10px] text-slate-500">
                      Ready: {new Date(asg.estimatedPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {asg.allocatedQuantity} meals
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 my-0.5" />
                    <span className="text-[10px] text-slate-500">{asg.distanceKm} km</span>
                  </div>

                  <div className="max-w-[45%] text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop-off</span>
                    <span className="font-semibold text-slate-800 truncate block">{asg.recipientName}</span>
                    <span className="text-[10px] text-slate-500">
                      ETA: {new Date(asg.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Safety Deadline vs Arrival Margin */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Safe Deadline: {new Date(asg.safeDeadline).toLocaleTimeString()}</span>
                  </div>

                  <div
                    className={`font-semibold text-[11px] ${
                      isAtRisk ? 'text-amber-700 font-bold' : 'text-emerald-600'
                    }`}
                  >
                    Buffer: +{asg.timeMarginMinutes} mins
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400">Vehicle: {asg.vehicleId || 'EV Courier'}</span>

                  {!isDelivered ? (
                    <button
                      onClick={() => markDeliveryCompleted(asg.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Delivery</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Delivered within safe deadline
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disruption Event History Audit Log */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          Disruption Event Audit Trail ({events.length} Events)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Chronological record of operational anomalies and automated recalculations
        </p>

        <div className="space-y-2 text-xs">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{evt.title}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      evt.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {evt.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{evt.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-slate-400 font-mono text-[11px]">
                <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Resolved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
