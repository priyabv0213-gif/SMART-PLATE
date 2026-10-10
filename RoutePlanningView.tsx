import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Clock,
  CheckCircle2,
  Navigation,
  Layers,
  HeartHandshake,
  Utensils,
  ChevronRight,
  Sparkles,
  Building2,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../map/RouteMap';
import { FoodDonation, SingleAssignment } from '../../types';
import { getFoodImage } from '../../data/foodImages';

export const RoutePlanningView: React.FC = () => {
  const {
    donations,
    recipients,
    vehicles,
    plannedRoutes,
    selectedCity,
    setActiveTab,
    currentPlan,
  } = useApp();

  const isAllIndia = selectedCity.toLowerCase().includes('all india');
  const cityName = selectedCity.split(',')[0].trim().toLowerCase();

  // Filter donations and recipients for this city
  const cityDonations = donations.filter((d) => {
    if (isAllIndia) return true;
    const itemCity = (d.city || '').toLowerCase();
    const itemAddress = (d.location?.address || d.location?.name || d.pickupAddress || '').toLowerCase();
    return itemCity.includes(cityName) || itemAddress.includes(cityName);
  });

  const cityRecipients = recipients.filter((r) => {
    if (isAllIndia) return true;
    const itemCity = (r.city || '').toLowerCase();
    const itemAddress = (r.location?.address || r.location?.name || '').toLowerCase();
    return itemCity.includes(cityName) || itemAddress.includes(cityName);
  });

  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(
    cityDonations[0] || null
  );

  const activeAssignments = currentPlan?.assignments || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Food Rescue Map</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                {selectedCity}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Locate available surplus food batches and nearby community kitchens ready for rescue.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center text-[8px] text-white">🍲</span>
            <span>Food Donors ({cityDonations.length})</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">🏠</span>
            <span>Recipients ({cityRecipients.length})</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3 h-3 rounded-sm bg-slate-900 flex items-center justify-center text-[8px] text-white">🚚</span>
            <span>Dispatches ({plannedRoutes.length})</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Interactive List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-100 mb-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Interactive Map: {selectedCity}</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Tap any pin for batch details & contact instructions
            </span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <RouteMap
              donations={cityDonations}
              recipients={cityRecipients}
              vehicles={vehicles}
              routes={plannedRoutes}
              selectedCity={selectedCity}
            />
          </div>
        </div>

        {/* Food Batches & Rescue Highlights in selected area */}
        <div className="space-y-4 flex flex-col">
          {/* Active Listings in this Area */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Available Batches in {selectedCity.split(',')[0]} ({cityDonations.length})
              </h3>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                View Catalog
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {cityDonations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No active donations registered in this location yet.</p>
                  <button
                    onClick={() => setActiveTab('donate')}
                    className="font-bold text-orange-600 hover:underline"
                  >
                    Donate food in {selectedCity.split(',')[0]}
                  </button>
                </div>
              ) : (
                cityDonations.map((d) => {
                  const isSelected = selectedDonation?.id === d.id;
                  const photo = getFoodImage(d.foodName || d.description, d.foodCategory, d.imageUrl);

                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDonation(d)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={photo.imageUrl} alt={photo.altText} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-900 text-xs truncate">
                            {d.foodName || d.description}
                          </h4>
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                            {d.quantity} {d.unit}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate">{d.donorName}</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="truncate max-w-[140px]">{d.location?.name || d.location?.address}</span>
                          <span className="text-emerald-700 font-semibold">{d.foodCategory}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Batch Mini Card */}
          {selectedDonation && (
            <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-sm space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Selected Food Batch
                  </span>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {selectedDonation.foodName || selectedDonation.description}
                  </h4>
                  <p className="text-[11px] text-slate-300">{selectedDonation.donorName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {selectedDonation.quantity} {selectedDonation.unit}
                </span>
              </div>

              <div className="p-2.5 bg-slate-800 rounded-xl space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Deadline: {new Date(selectedDonation.verifiedSafeDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">{selectedDonation.location?.address || selectedDonation.location?.name}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('request')}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <span>Request This Food Batch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
