import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Thermometer,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodDonation } from '../../types';

export const AvailableDonationsView: React.FC = () => {
  const { donations, setActiveTab, currentPlan } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);

  const availableBatches = donations.filter((d) => {
    if (selectedCategory !== 'All' && d.foodCategory !== selectedCategory) return false;
    return d.status === 'Available' || d.status === 'Allocated';
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Available Surplus Food in Coimbatore</h1>
            <p className="text-xs text-slate-500">
              Active verified surplus food batches ready for immediate pickup and redistribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Cooked meals">Cooked meals</option>
            <option value="Rice & prepared dishes">Rice & prepared dishes</option>
            <option value="Bakery products">Bakery products</option>
            <option value="Fruits & vegetables">Fruits & vegetables</option>
            <option value="Dairy & chilled">Dairy & chilled</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {availableBatches.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
            No surplus batches currently available in this category.
          </div>
        ) : (
          availableBatches.map((batch) => {
            const deadlineDate = new Date(batch.verifiedSafeDeadline);
            const minutesLeft = Math.floor((deadlineDate.getTime() - Date.now()) / 60000);
            const isExpiringSoon = minutesLeft > 0 && minutesLeft < 60;
            const isExpired = minutesLeft <= 0;

            const assignment = currentPlan?.assignments.find((a) => a.donationId === batch.id);

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all relative"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{batch.id}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{batch.donorName}</h3>
                      <span className="text-[11px] text-slate-500">{batch.donorType}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        batch.safetyVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {batch.safetyVerified ? 'FSSAI VERIFIED' : 'PENDING AUDIT'}
                    </span>
                  </div>

                  {/* Quantity and Category */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-extrabold text-emerald-700">
                      {batch.quantity} {batch.unit}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {batch.foodCategory}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {batch.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Storage Temp:</span>
                      <span className="font-semibold text-slate-800 capitalize flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                        {batch.storageCondition} {batch.currentTempC ? `(${batch.currentTempC}°C)` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pickup Location:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {batch.location.name || batch.location.address}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Safe Deadline:</span>
                      <span
                        className={`font-bold ${
                          isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600 animate-pulse' : 'text-emerald-700'
                        }`}
                      >
                        {isExpired ? 'EXPIRED' : `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {assignment ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Assigned to {assignment.recipientName.slice(0, 16)}...
                    </span>
                  ) : (
                    <span className="text-slate-500">Ready for dispatch</span>
                  )}

                  <button
                    onClick={() => setActiveTab('allocation')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors shrink-0"
                  >
                    <span>View Match</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
