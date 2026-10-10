import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  Clock,
  MapPin,
  Thermometer,
  ShieldCheck,
  Building2,
  Utensils,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  HeartHandshake,
  ArrowRight,
  Map as MapIcon,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodDonation } from '../../types';
import { getFoodImage } from '../../data/foodImages';
import { RouteMap } from '../map/RouteMap';

export const ExploreFoodView: React.FC = () => {
  const {
    donations,
    recipients,
    vehicles,
    plannedRoutes,
    setActiveTab,
    currentPlan,
    selectedCity,
    setSelectedCity,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [sortBy, setSortBy] = useState<'soonest' | 'quantity' | 'name'>('soonest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const categories = [
    'All',
    'Cooked meals',
    'Rice & prepared dishes',
    'Bakery products',
    'Fruits & vegetables',
    'Dairy & chilled',
  ];

  // Location-aware filtering:
  // If 'All India', show all; otherwise check if city or address matches the selected city.
  const isAllIndia = selectedCity.toLowerCase().includes('all india');
  const cityName = selectedCity.split(',')[0].trim().toLowerCase();

  const cityFilteredDonations = donations.filter((d) => {
    if (isAllIndia) return true;
    const itemCity = (d.city || '').toLowerCase();
    const itemAddress = (d.location?.address || d.location?.name || d.pickupAddress || '').toLowerCase();
    return itemCity.includes(cityName) || itemAddress.includes(cityName);
  });

  const filteredBatches = cityFilteredDonations
    .filter((d) => {
      // Filter out completed or non-active donations
      if (d.status === 'Delivered' || d.status === 'Sent to approved recovery' || d.status === 'Rejected') return false;

      // Category filter
      if (selectedCategory !== 'All' && d.foodCategory !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (d.foodName || d.description || '').toLowerCase().includes(query);
        const matchesDonor = (d.donorName || '').toLowerCase().includes(query);
        const matchesLoc = (d.location?.name || d.location?.address || d.pickupAddress || '').toLowerCase();
        const matchesDesc = (d.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDonor && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'soonest') {
        const timeA = new Date(a.verifiedSafeDeadline).getTime();
        const timeB = new Date(b.verifiedSafeDeadline).getTime();
        return timeA - timeB;
      }
      if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      }
      return (a.foodName || a.description || '').localeCompare(b.foodName || b.description || '');
    });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-emerald-600 p-6 sm:p-8 text-white shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Surplus Food in {selectedCity}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Fresh Surplus Batches Ready for Rescue
          </h1>
          <p className="text-xs sm:text-sm text-white/90">
            Browse verified edible meals donated by restaurants, hotels and caterers. Free for registered NGOs and community kitchens.
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, Sort, and Grid/Map Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Biryani, Chapati, Idli, Dosa), restaurants, or localities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="soonest">Expiring Soonest</option>
                <option value="quantity">Highest Quantity</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Rescue Map) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Rescue Map View"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rescue Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills & Selected City Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedCity}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-700">
              {filteredBatches.length} {filteredBatches.length === 1 ? 'batch' : 'batches'} available
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: RESCUE MAP VIEW */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-emerald-600" />
                <span>Geographical Rescue Map — {selectedCity}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing available donor food batches and community recipient hubs
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Available Food
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Recipient Kitchens
              </span>
            </div>
          </div>

          <div className="h-[520px] rounded-2xl overflow-hidden relative border border-slate-100">
            <RouteMap
              donations={cityFilteredDonations}
              recipients={recipients}
              vehicles={vehicles}
              routes={plannedRoutes}
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {filteredBatches.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                <Utensils className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  No surplus food batches found in {selectedCity}
                </h3>
                <p className="text-xs text-slate-500">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try clearing your search query or switching categories.'
                    : `No active donations registered in ${selectedCity} right now. Sample verified scenario listings are active in Coimbatore.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedCity('Coimbatore, Tamil Nadu')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch to Coimbatore (Demo Hub)</span>
                </button>

                <button
                  onClick={() => setActiveTab('donate')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Be the First to Donate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch) => {
                const deadlineDate = new Date(batch.verifiedSafeDeadline);
                const minutesLeft = Math.floor((deadlineDate.getTime() - Date.now()) / 60000);
                const isExpiringSoon = minutesLeft > 0 && minutesLeft < 120;
                const isExpired = minutesLeft <= 0;

                const assignment = currentPlan?.assignments.find((a) => a.donationId === batch.id);

                // Authentic food image helper
                const photoInfo = getFoodImage(
                  batch.foodName || batch.description,
                  batch.foodCategory,
                  batch.imageUrl
                );

                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-orange-300"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={photoInfo.imageUrl}
                          alt={photoInfo.altText}
                          onError={(e) => {
                            // Graceful fallback to category image if link ever fails
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Quantity Badge */}
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                          {batch.quantity} {batch.unit}
                        </div>

                        {/* FSSAI safety badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-2xs ${
                              batch.safetyVerified
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-amber-500/90 text-white'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{batch.safetyVerified ? 'FSSAI Verified' : 'Standard Gate'}</span>
                          </span>
                        </div>

                        {/* Illustrative Label if representative */}
                        {photoInfo.illustrative && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="text-[9px] font-semibold bg-slate-950/60 text-slate-200 px-2 py-0.5 rounded backdrop-blur-xs">
                              Illustrative food photo
                            </span>
                          </div>
                        )}

                        {/* Expiry Pill overlay on bottom-right of photo */}
                        <div className="absolute bottom-2.5 right-2.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 ${
                              isExpired
                                ? 'bg-red-600 text-white'
                                : isExpiringSoon
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-white/95 text-emerald-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {isExpired
                                ? 'Safe Window Closed'
                                : `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m left`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {batch.foodCategory}
                            </span>
                            <span className="text-emerald-700 font-semibold">
                              {batch.city || selectedCity.split(',')[0]}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                            {batch.foodName || batch.description}
                          </h3>
                        </div>

                        {/* Donor and Location info */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">{batch.donorName}</span>
                            <span className="text-slate-400">• {batch.donorType}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {batch.location?.name || batch.location?.address || batch.pickupAddress}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="capitalize text-slate-700">
                              {batch.storageCondition} {batch.currentTempC ? `(${batch.currentTempC}°C)` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Active Match Status if already paired */}
                        {assignment && (
                          <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-semibold truncate max-w-[170px]">
                                Matched: {assignment.recipientName}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {assignment.allocatedQuantity} meals
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedDonation(batch)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition-colors"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => setActiveTab('request')}
                        className="py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Request Food</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Non-commercial platform notice */}
      <div className="p-4 bg-slate-100/90 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
        <p>
          <strong className="text-slate-700">SmartPlate Non-Commercial Guarantee:</strong> All listed food is surplus stock donated freely by registered food establishments to prevent avoidable hunger and landfill waste. No payments or fees are charged to recipient shelters or charities.
        </p>
      </div>

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  {selectedDonation.foodCategory}
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">
                  {selectedDonation.foodName || selectedDonation.description}
                </h2>
                <p className="text-xs text-slate-500">{selectedDonation.donorName}</p>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="h-52 rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src={
                  getFoodImage(
                    selectedDonation.foodName || selectedDonation.description,
                    selectedDonation.foodCategory,
                    selectedDonation.imageUrl
                  ).imageUrl
                }
                alt={selectedDonation.foodName || selectedDonation.description}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Batch Quantity</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedDonation.quantity} {selectedDonation.unit}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Safe Deadline</span>
                <span className="font-bold text-slate-900 text-sm">
                  {new Date(selectedDonation.verifiedSafeDeadline).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Handling Condition</span>
                <span className="font-bold text-slate-900 capitalize">
                  {selectedDonation.storageCondition} {selectedDonation.currentTempC ? `(${selectedDonation.currentTempC}°C)` : ''}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">FSSAI Pre-Check</span>
                <span className="font-bold text-emerald-600">
                  {selectedDonation.safetyVerified ? 'Passed Pre-Check' : 'Audit Gate Required'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Batch Description & Packaging:</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedDonation.description || 'Prepared fresh in food-grade insulated containers ready for immediate thermal dispatch.'}
              </p>
            </div>

            {/* Location & Instructions */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Pickup Location:</span>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {selectedDonation.location?.name || selectedDonation.location?.address || selectedDonation.pickupAddress}
                </span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedDonation(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDonation(null);
                  setActiveTab('request');
                }}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Request This Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
