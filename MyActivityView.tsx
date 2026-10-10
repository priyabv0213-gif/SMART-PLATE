import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Building2,
  Utensils,
  MapPin,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  PackageCheck,
  Navigation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getFoodImage } from '../../data/foodImages';

export const MyActivityView: React.FC = () => {
  const {
    currentUser,
    donations,
    recipients,
    currentPlan,
    markDeliveryCompleted,
    setActiveTab,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'donations' | 'requests' | 'deliveries'>('all');

  // Filter donations relevant to the current user (or show all in demo/coordinator mode)
  const isDemoOrAdmin = currentUser.role === 'coordinator' || currentUser.role === 'judge_demo';

  const myDonations = isDemoOrAdmin
    ? donations
    : donations.filter(
        (d) =>
          d.donorName.toLowerCase().includes(currentUser.organization.toLowerCase()) ||
          d.donorName.toLowerCase().includes(currentUser.name.toLowerCase())
      );

  const activeAssignments = currentPlan?.assignments || [];

  // Summary counts
  const totalDelivered = activeAssignments.filter((a) => a.status === 'Delivered').length;
  const totalMatched = activeAssignments.filter((a) => a.status !== 'Delivered').length;
  const totalListed = myDonations.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Activity & Rescue Tracking</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                {currentUser.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your listed surplus batches, recipient assignments, and real-time delivery milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('donate')}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4" />
            <span>Donate Food</span>
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Request Food</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium block">Total Listed</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{totalListed}</span>
          <span className="text-[10px] text-slate-500">Batches registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-blue-500 font-medium block">Currently Matched</span>
          <span className="text-2xl font-black text-blue-600 mt-0.5 block">{totalMatched}</span>
          <span className="text-[10px] text-slate-500">Assigned & in motion</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-emerald-500 font-medium block">Safely Delivered</span>
          <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{totalDelivered}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">100% on time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-purple-500 font-medium block">Active Beneficiaries</span>
          <span className="text-2xl font-black text-purple-600 mt-0.5 block">{recipients.length}</span>
          <span className="text-[10px] text-slate-500">Shelters & kitchens</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'donations', label: `My Donations (${myDonations.length})` },
          { id: 'deliveries', label: `Matched Deliveries (${activeAssignments.length})` },
          { id: 'requests', label: `Recipient Demand (${recipients.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVITY LIST */}
      <div className="space-y-4">
        {/* Render Active Delivery Assignments */}
        {(filterType === 'all' || filterType === 'deliveries') && activeAssignments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Delivery Missions
            </h3>

            {activeAssignments.map((a) => {
              const don = donations.find((d) => d.id === a.donationId);
              const photo = getFoodImage(a.foodName || a.donorName, a.foodCategory, don?.imageUrl);
              const isDelivered = a.status === 'Delivered';

              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={photo.imageUrl} alt={photo.altText} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {a.foodName || don?.foodName || a.donorName}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isDelivered ? 'Delivered' : 'Matched & Scheduled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {a.allocatedQuantity} meals • {a.foodCategory}
                        </p>
                      </div>
                    </div>

                    {/* Next Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isDelivered ? (
                        <button
                          onClick={() => markDeliveryCompleted(a.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Confirm Received</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Completed</span>
                        </span>
                      )}

                      <button
                        onClick={() => setActiveTab('map')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        title="View route map"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Map</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Step Progress Tracker */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                      <div className="text-emerald-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1 text-[10px] font-bold">
                          ✓
                        </div>
                        <span>Listed</span>
                      </div>
                      <div className="text-emerald-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1 text-[10px] font-bold">
                          ✓
                        </div>
                        <span>Matched</span>
                      </div>
                      <div className={isDelivered ? 'text-emerald-700' : 'text-blue-600 font-bold'}>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto mb-1 text-[10px] font-bold ${
                            isDelivered ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white animate-pulse'
                          }`}
                        >
                          {isDelivered ? '✓' : '•'}
                        </div>
                        <span>Dispatched</span>
                      </div>
                      <div className={isDelivered ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto mb-1 text-[10px] font-bold ${
                            isDelivered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isDelivered ? '✓' : '4'}
                        </div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Route & Recipient metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>
                        <strong>Donor:</strong> {a.donorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Recipient:</strong> {a.recipientName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong>Est. Travel:</strong> ~{a.travelTimeMinutes} mins ({a.distanceKm} km)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Safe Buffer: +{a.timeMarginMinutes} mins</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render My Donations */}
        {(filterType === 'all' || filterType === 'donations') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Registered Food Donations ({myDonations.length})
            </h3>

            {myDonations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <p className="text-xs">No donations registered under your account yet.</p>
                <button
                  onClick={() => setActiveTab('donate')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Register a donation now
                </button>
              </div>
            ) : (
              myDonations.map((d) => {
                const photo = getFoodImage(d.foodName || d.description, d.foodCategory, d.imageUrl);
                const assignment = currentPlan?.assignments.find((a) => a.donationId === d.id);
                const isMatched = Boolean(assignment);

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={photo.imageUrl} alt={photo.altText} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {d.foodName || d.description}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isMatched
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isMatched ? 'Matched' : 'Available for Match'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {d.quantity} {d.unit} • {d.donorName} • {d.location?.name || d.location?.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        View in Catalog
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Render Recipient Demand */}
        {(filterType === 'all' || filterType === 'requests') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Community Kitchen & Shelter Requests ({recipients.length})
            </h3>

            {recipients.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{rec.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {rec.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Demand: <strong>{rec.demandQuantity} meals</strong> (Max capacity: {rec.maxReceivingCapacity} meals)
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{rec.location.address || rec.location.name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('donate')}
                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>Fulfill Need</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
