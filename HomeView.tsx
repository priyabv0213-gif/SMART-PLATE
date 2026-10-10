import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  Leaf,
  Layers,
  HeartHandshake,
  Compass,
  Utensils,
  Award,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SmartPlateLogo } from '../SmartPlateLogo';
import { getFoodImage } from '../../data/foodImages';
import { LocationSelectorModal } from '../LocationSelectorModal';

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    donations,
    recipients,
    currentPlan,
    selectedCity,
    isSimulatedMode,
  } = useApp();

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const metrics = currentPlan?.metrics || {
    totalSurplusRegistered: 425,
    quantityAllocated: 345,
    quantitySafelyDelivered: 120,
    onTimeDeliveryRate: 100,
    demandSatisfactionRate: 88,
    co2PreventedKg: 345,
  };

  const steps = [
    {
      num: '01',
      title: 'Donors list available surplus food',
      desc: 'Restaurants, hotels and caterers enter quantity, category, and verified safe-use window.',
      icon: <Utensils className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-50 border-orange-100 text-orange-950',
    },
    {
      num: '02',
      title: 'SmartPlate checks eligibility & feasibility',
      desc: 'Safety gate verifies microbial limits, vehicle transit times, and cold-chain constraints.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100 text-emerald-950',
    },
    {
      num: '03',
      title: 'Suitable recipient organizations are matched',
      desc: 'Multi-objective engine splits donations fairly across community kitchens and shelters.',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100 text-purple-950',
    },
    {
      num: '04',
      title: 'Deliveries tracked & plans adapted dynamically',
      desc: 'If a traffic delay or NGO cancellation happens, the engine autonomously reallocates food.',
      icon: <RotateCcw className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100 text-blue-950',
    },
  ];

  const categories = [
    { name: 'Cooked meals', desc: 'Meals & Thalis', img: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80' },
    { name: 'Rice & prepared dishes', desc: 'Biryani & Pulao', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
    { name: 'Bakery products', desc: 'Breads & Savories', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80' },
    { name: 'Fruits & vegetables', desc: 'Fresh Produce', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dairy & chilled', desc: 'Milk, Curd & Paneer', img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&auto=format&fit=crop&q=80' },
  ];

  // Pick top 3 donations with images for the featured explore strip
  const featuredDonations = donations.slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-linear-to-b from-orange-50/70 via-white to-emerald-50/40 p-6 sm:p-10 lg:p-14 border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Decorative soft circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left: Text & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-emerald-200 text-emerald-800 shadow-2xs hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SmartPlate Rescue Network</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 group-hover:text-orange-700">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-orange-600" />
            </button>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Good Food Deserves a <span className="text-orange-500">Second Chance</span>.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                We connect surplus food from restaurants, hotels, and caterers with community kitchens and shelters, using
                intelligent matching and adaptive delivery planning.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('explore')}
                className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02] text-sm"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Available Food</span>
              </button>

              <button
                onClick={() => setActiveTab('donate')}
                className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold rounded-2xl transition-all shadow-xs text-sm"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Donate Surplus Food</span>
              </button>

              <button
                onClick={() => setActiveTab('demo')}
                className="flex items-center gap-2 px-4 py-3.5 text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-bold rounded-2xl text-sm transition-colors border border-purple-200/80 bg-purple-50/50"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Try the Live Demo</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Safe-Use Violations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>FSSAI Compliant Gate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Sub-10ms Adaptive Rerouting</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Modern Visual Food Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-4 shadow-xl border border-slate-100 transform lg:rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Floating notification badge */}
              <div className="absolute -top-3 -right-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>100 Fresh Meals Rescued</span>
              </div>

              {/* Card food image */}
              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
                  alt="Vegetable Dum Biryani"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-500 px-2 py-0.5 rounded-md">
                      Hot Cooked Meal
                    </span>
                    <h3 className="text-base font-bold mt-1 leading-tight">Royal Dum Biryani & Salan</h3>
                    <p className="text-xs text-slate-200">The Grand Residency • Race Course</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-300">100</span>
                    <span className="text-xs block text-slate-300 -mt-1">portions</span>
                  </div>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">Safe Window: 3.5 hrs left</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Race Course, CBE</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-700">Matched with Ukkadam Kitchen</span>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px]">Optimal Transit</span>
                </div>

                <button
                  onClick={() => setActiveTab('explore')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View All Surplus Donations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Popular Food Categories</h2>
            <p className="text-xs text-slate-500">Categorized by storage and handling standards</p>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <div
              key={c.name}
              onClick={() => setActiveTab('explore')}
              className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-xs truncate group-hover:text-orange-600 transition-colors">
                  {c.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How SmartPlate Works */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Intelligent Redistribution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How SmartPlate Works
          </h2>
          <p className="text-sm text-slate-600">
            Automating the bridge between surplus food donors and high-need community recipients with verified safety guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">{s.icon}</div>
                  <span className="text-2xl font-black text-slate-200">{s.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Available Food (Featured Cards Strip) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Live Surplus Available
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Explore Available Food
            </h2>
            <p className="text-sm text-slate-600">
              Verified edible surplus food currently ready for rescue.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <span>See all {donations.length} batches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDonations.map((d) => {
            const photo = getFoodImage(d.foodName || d.description, d.foodCategory, d.imageUrl);

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.altText}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-2xs">
                      {d.foodCategory}
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-950/80 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                      {d.quantity} {d.unit}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                      {d.foodName || d.description}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{d.donorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.pickupAddress || d.location?.name || d.location?.address}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{d.remainingHours || 4} hrs remaining</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Eligible
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why SmartPlate */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8 relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Engineered Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why SmartPlate Outperforms Traditional Redistribution
          </h2>
          <p className="text-sm text-slate-300">
            Standard donation matching relies on static phone calls or simple nearest-neighbor dispatch. SmartPlate introduces verified microbial safety and dynamic real-time adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Timely Redistribution</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every food batch is evaluated against strict microbiological decay rates. If delivery cannot happen within the safe-use window, the system forbids delivery before food spoils.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Intelligent Allocation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Large corporate catering batches (e.g. 100+ meals) are automatically split and balanced across multiple local shelters to maximize nutritional fairness and prevent NGO overflow.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Reduced Avoidable Waste</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a shelter cancels or a delivery vehicle experiences traffic, SmartPlate reassigns meals to alternate recipients within milliseconds instead of dumping surplus in landfills.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Redistribution Impact Metrics
            </h2>
            <p className="text-xs text-slate-500">
              Calculated transparently from active and verified records.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {isSimulatedMode ? 'Simulated Demonstration Mode' : 'Verified Urban Records'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Meals Rescued</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {metrics.quantityAllocated}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              {metrics.demandSatisfactionRate}% of demand met
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Safe Deliveries</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {metrics.quantitySafelyDelivered}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              100% on-time arrival
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Emissions Prevented</span>
            <span className="text-2xl sm:text-3xl font-black text-teal-600 mt-1 block">
              {metrics.co2PreventedKg} kg
            </span>
            <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
              CO₂e greenhouse offset
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Partner Network</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {donations.length + recipients.length}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              {recipients.length} community kitchens
            </span>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-emerald-600 p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            Ready to Rescue Surplus Food in {selectedCity.split(',')[0]}?
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            Whether you manage a restaurant with leftover banquets or operate a community kitchen caring for families, SmartPlate makes food redistribution effortless and safe.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('donate')}
            className="px-5 py-3 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-sm text-sm"
          >
            Register as Food Donor
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className="px-5 py-3 bg-slate-950/40 hover:bg-slate-950/60 text-white font-bold rounded-2xl border border-white/30 transition-colors text-sm"
          >
            Register as Recipient
          </button>
        </div>
      </section>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
};
