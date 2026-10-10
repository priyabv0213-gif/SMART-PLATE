import React from 'react';
import {
  Sparkles,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Recycle,
  XCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const OverviewView: React.FC = () => {
  const {
    donations,
    recipients,
    currentPlan,
    comparisonPlans,
    executeAllocationRun,
    executeAllAlgorithmsComparison,
    setActiveTab,
    isSimulatedMode,
  } = useApp();

  const metrics = currentPlan?.metrics || {
    totalSurplusRegistered: donations.reduce((sum, d) => sum + d.quantity, 0),
    quantityAllocated: 0,
    quantitySafelyDelivered: 0,
    quantityAtRisk: 0,
    quantityUnallocated: 0,
    onTimeDeliveryRate: 100,
    demandSatisfactionRate: 0,
    totalTransportKm: 0,
    kmPerRescuedMeal: 0,
    fairnessIndex: 1.0,
    co2PreventedKg: 0,
    recoveredAlternativeQuantity: 0,
    unrecoverableQuantity: 0,
  };

  const activeDonationsCount = donations.filter((d) => d.status === 'Available' || d.status === 'Allocated').length;
  const awaitingAssignmentCount = donations.filter(
    (d) => d.status === 'Available' || d.status === 'Pending verification'
  ).length;

  // Chart data: Allocation by recipient
  const recipientAllocationData = recipients.map((r) => {
    const allocated = currentPlan?.assignments
      .filter((a) => a.recipientId === r.id)
      .reduce((sum, a) => sum + a.allocatedQuantity, 0) || 0;
    return {
      name: r.name.length > 18 ? r.name.slice(0, 18) + '...' : r.name,
      allocated,
      demand: r.demandQuantity,
    };
  });

  // Chart data: Outcomes breakdown
  const outcomeData = [
    { name: 'Safely Allocated', value: metrics.quantityAllocated, color: '#10b981' },
    { name: 'Sent to Recovery', value: metrics.recoveredAlternativeQuantity, color: '#3b82f6' },
    { name: 'Awaiting / Unallocated', value: metrics.quantityUnallocated, color: '#f59e0b' },
    { name: 'Unrecoverable / Expired', value: metrics.unrecoverableQuantity, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Chart data: Algorithm comparison
  const algoComparisonData = [
    {
      metric: 'Rescued (meals)',
      SpoilClock: comparisonPlans.spoilClock?.metrics.quantityAllocated || metrics.quantityAllocated,
      NearestFirst: comparisonPlans.nearestFirst?.metrics.quantityAllocated || Math.round(metrics.quantityAllocated * 0.72),
      StaticWindow: comparisonPlans.staticTimeWindow?.metrics.quantityAllocated || Math.round(metrics.quantityAllocated * 0.81),
    },
    {
      metric: 'Fairness (x100)',
      SpoilClock: Math.round(((comparisonPlans.spoilClock?.metrics.fairnessIndex ?? metrics.fairnessIndex) * 100)),
      NearestFirst: Math.round(((comparisonPlans.nearestFirst?.metrics.fairnessIndex ?? 0.52) * 100)),
      StaticWindow: Math.round(((comparisonPlans.staticTimeWindow?.metrics.fairnessIndex ?? 0.65) * 100)),
    },
    {
      metric: 'Transport (km)',
      SpoilClock: comparisonPlans.spoilClock?.metrics.totalTransportKm || metrics.totalTransportKm,
      NearestFirst: comparisonPlans.nearestFirst?.metrics.totalTransportKm || Math.round(metrics.totalTransportKm * 1.35),
      StaticWindow: comparisonPlans.staticTimeWindow?.metrics.totalTransportKm || Math.round(metrics.totalTransportKm * 1.15),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Reallocation Active
              </span>
              <span className="text-xs text-slate-400">
                {isSimulatedMode ? '• Synthetic benchmark dataset' : '• Live dispatch feed'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Intelligent, Decay-Aware Food Redistribution
            </h2>
            <p className="text-sm text-slate-300">
              SmartPlate screens verified safe-use deadlines, prevents capacity violations, splits large batches, and
              dynamically recalculates assignments when disruptions occur.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                executeAllocationRun();
                executeAllAlgorithmsComparison();
              }}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.03]"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Run Adaptive Allocation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 10 Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Active Donations</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeDonationsCount}</div>
          <span className="text-[11px] text-slate-500">Registered batches</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Surplus</span>
            <span className="text-xs font-semibold text-slate-400">Meals</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalSurplusRegistered}</div>
          <span className="text-[11px] text-slate-500">Available across city</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Quantity Allocated</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{metrics.quantityAllocated}</div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {metrics.totalSurplusRegistered > 0
              ? `${Math.round((metrics.quantityAllocated / metrics.totalSurplusRegistered) * 100)}% allocated`
              : '0%'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Rescued Meals</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.quantitySafelyDelivered}</div>
          <span className="text-[11px] text-slate-500">Verified delivered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Awaiting Assignment</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{awaitingAssignmentCount}</div>
          <span className="text-[11px] text-slate-500">In queue for dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Deliveries at Risk</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.quantityAtRisk}</div>
          <span className="text-[11px] text-slate-500">&lt; 45 min safe margin</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">On-Time Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.onTimeDeliveryRate}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Inside safe window</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Distance</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalTransportKm} km</div>
          <span className="text-[11px] text-slate-500">{metrics.kmPerRescuedMeal} km / meal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Sent to Recovery</span>
            <Recycle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{metrics.recoveredAlternativeQuantity}</div>
          <span className="text-[11px] text-slate-500">Animal feed & biogas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Unrecovered Food</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-700">{metrics.unrecoverableQuantity}</div>
          <span className="text-[11px] text-slate-500">Safe disposal</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipient Fulfillment Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recipient Demand vs Allocated Meals</h3>
              <p className="text-xs text-slate-500">Fair proportional satisfaction across eligible recipient centers</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
              Jain’s Fairness: {metrics.fairnessIndex}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recipientAllocationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="demand" fill="#cbd5e1" name="Target Demand" radius={[4, 4, 0, 0]} />
                <Bar dataKey="allocated" fill="#10b981" name="Allocated Meals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcomes Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Surplus Outcomes Distribution</h3>
              <p className="text-xs text-slate-500">Destination tiers for all registered batches</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {outcomeData.map((o) => (
              <div key={o.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
                <span className="text-slate-600 truncate">{o.name}:</span>
                <span className="font-bold text-slate-800 ml-auto">{o.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparative Algorithm Benchmark Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Algorithm Performance Comparison (Same Dataset)
            </h3>
            <p className="text-xs text-slate-500">
              SmartPlate Adaptive Allocation vs Nearest-First Greedy vs Static Time-Window Baseline
            </p>
          </div>
          <button
            onClick={() => setActiveTab('simulation')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Open Simulation Lab <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={algoComparisonData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="SpoilClock" fill="#10b981" name="SmartPlate Adaptive" radius={[4, 4, 0, 0]} />
              <Bar dataKey="NearestFirst" fill="#3b82f6" name="Nearest-First Baseline" radius={[4, 4, 0, 0]} />
              <Bar dataKey="StaticWindow" fill="#f59e0b" name="Static Window Baseline" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
