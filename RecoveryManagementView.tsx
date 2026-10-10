import React from 'react';
import {
  Recycle,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Trash2,
  Layers,
  Leaf,
  Fuel,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecoveryManagementView: React.FC = () => {
  const { recoveryRecords } = useApp();

  const totalDiverted = recoveryRecords.reduce((sum, r) => sum + r.quantity, 0);
  const animalFeedTotal = recoveryRecords
    .filter((r) => r.recoveryCategory === 'Animal Feed')
    .reduce((sum, r) => sum + r.quantity, 0);
  const compostingTotal = recoveryRecords
    .filter((r) => r.recoveryCategory === 'Composting')
    .reduce((sum, r) => sum + r.quantity, 0);
  const biogasTotal = recoveryRecords
    .filter((r) => r.recoveryCategory === 'Biogas Digestion')
    .reduce((sum, r) => sum + r.quantity, 0);
  const disposalTotal = recoveryRecords
    .filter((r) => r.recoveryCategory === 'Safe Disposal')
    .reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Approved Circular Recovery Management</h2>
            <p className="text-xs text-slate-500">
              Regulatory compliance routing for surplus food that cannot be redistributed for human consumption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
            {recoveryRecords.length} Traceable Records
          </span>
        </div>
      </div>

      {/* Recovery Hierarchy Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Animal Feed</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{animalFeedTotal}</div>
          <span className="text-[11px] text-slate-500">Certified livestock feed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Composting</span>
            <Recycle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{compostingTotal}</div>
          <span className="text-[11px] text-slate-500">Aerobic organic soil amendment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Biogas Digestion</span>
            <Fuel className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{biogasTotal}</div>
          <span className="text-[11px] text-slate-500">Renewable biomethane energy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Safe Thermal Disposal</span>
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-700">{disposalTotal}</div>
          <span className="text-[11px] text-slate-500">Non-recoverable safe incinerate</span>
        </div>
      </div>

      {/* Recovery Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">Regulatory Recovery Manifests & Chain-of-Custody</h3>
          <p className="text-xs text-slate-500">
            Certified destinations, failure causes, and EPA/FDA regulatory compliance standards
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Record ID & Batch</th>
                <th className="py-3 px-4">Reason Human Redistribution Failed</th>
                <th className="py-3 px-4">Approved Recovery Tier</th>
                <th className="py-3 px-4">Receiving Facility</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Regulatory Standard</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recoveryRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No batches diverted to alternative recovery.
                  </td>
                </tr>
              ) : (
                recoveryRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{rec.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Donor: <span className="text-slate-700 font-medium">{rec.donorName}</span> ({rec.donationId})
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.timestamp).toLocaleString()}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-800 text-[11px] leading-relaxed">
                        {rec.reasonHumanConsumptionFailed}
                      </div>
                    </td>

                    {/* Category Tier */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rec.recoveryCategory === 'Animal Feed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.recoveryCategory === 'Composting'
                            ? 'bg-blue-100 text-blue-800'
                            : rec.recoveryCategory === 'Biogas Digestion'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rec.recoveryCategory}
                      </span>
                    </td>

                    {/* Facility */}
                    <td className="py-3 px-4 text-[11px] text-slate-700 font-medium max-w-xs">
                      {rec.receivingFacility}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {rec.quantity} {rec.unit}
                    </td>

                    {/* Regulatory Standard */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{rec.verificationRule}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{rec.regulatoryComplianceNotes}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {rec.handoverStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
