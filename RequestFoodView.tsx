import React, { useState } from 'react';
import {
  Building2,
  HandHeart,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Snowflake,
  Flame,
  Truck,
  Sparkles,
  ArrowRight,
  Compass,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RecipientType, FoodCategory } from '../../types';
import { findLocationById } from '../../data/locations';

export const RequestFoodView: React.FC = () => {
  const { addRecipient, setActiveTab, selectedCity } = useApp();
  const cityObj = findLocationById(selectedCity);

  const [name, setName] = useState('Universal Peace Foundation Orphanage & Care');
  const [type, setType] = useState<RecipientType>('Shelter');
  const [address, setAddress] = useState(
    selectedCity.toLowerCase().includes('coimbatore')
      ? 'Trichy Road, Singanallur, Coimbatore, Tamil Nadu'
      : `${cityObj.popularLocalities?.[0] || 'Center Hub'}, ${cityObj.displayName}`
  );
  const [demandQuantity, setDemandQuantity] = useState(65);
  const [maxReceivingCapacity, setMaxReceivingCapacity] = useState(80);
  const [operatingOpen, setOperatingOpen] = useState('09:00');
  const [operatingClose, setOperatingClose] = useState('21:00');
  const [hasColdStorage, setHasColdStorage] = useState(true);
  const [hasReheatingFacility, setHasReheatingFacility] = useState(true);
  const [transportationCapability, setTransportationCapability] = useState<'Self-pickup' | 'Delivery-only' | 'Both'>('Both');
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([
    'Cooked meals',
    'Rice & prepared dishes',
    'Bakery products',
  ]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const allCategories: FoodCategory[] = [
    'Cooked meals',
    'Rice & prepared dishes',
    'Bakery products',
    'Fruits & vegetables',
    'Dairy & chilled',
    'Packaged food',
  ];

  const handleToggleCategory = (cat: FoodCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecipient({
      name,
      type,
      city: cityObj.name,
      location: {
        lat: cityObj.lat + (Math.random() - 0.5) * 0.015,
        lng: cityObj.lng + (Math.random() - 0.5) * 0.015,
        name,
        address,
      },
      demandQuantity: Number(demandQuantity),
      maxReceivingCapacity: Number(maxReceivingCapacity),
      currentStorageCapacity: Number(maxReceivingCapacity),
      operatingHours: { open: operatingOpen, close: operatingClose },
      minAcceptableQuantity: 10,
      maxAcceptableQuantity: Number(maxReceivingCapacity),
      hasColdStorage,
      hasReheatingFacility,
      transportationCapability,
      acceptedCategories: selectedCategories,
      active: true,
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HandHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Request Food for Community Organization</h1>
            <p className="text-xs text-slate-500">
              Register your shelter, community kitchen, or orphanage in {selectedCity} to receive matched food donations
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
          Verified NGO Channel
        </span>
      </div>

      {submittedSuccess ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-emerald-950">Food Request Registered!</h2>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your organization requirements are now active in the {selectedCity} allocation pool. The engine will match incoming surplus batches within your operating hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Available Food Batches</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Track in My Activity</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-xs">
          {/* Organization Info */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Organization & Intake Center
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Universal Peace Foundation Singanallur"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RecipientType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Community Kitchen">Community Kitchen (Feeding Center)</option>
                  <option value="Food Bank">Food Bank & Pantry Hub</option>
                  <option value="Shelter">Shelter / Orphanage / Old Age Home</option>
                  <option value="Homeless Outreach">Street Homeless Outreach</option>
                  <option value="Youth Center">Children & Youth Center</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Facility Address ({selectedCity})</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address in city"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Demand & Capacity */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Beneficiaries & Capacity Limits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Daily Meal Demand (Persons to Feed)</label>
                <input
                  type="number"
                  min={5}
                  required
                  value={demandQuantity}
                  onChange={(e) => setDemandQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Total meals required for feeding session</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Maximum Physical Intake Capacity</label>
                <input
                  type="number"
                  min={5}
                  required
                  value={maxReceivingCapacity}
                  onChange={(e) => setMaxReceivingCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Prevents overflow & spoilage at facility</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Intake Operating Open</label>
                <input
                  type="time"
                  required
                  value={operatingOpen}
                  onChange={(e) => setOperatingOpen(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Intake Operating Close</label>
                <input
                  type="time"
                  required
                  value={operatingClose}
                  onChange={(e) => setOperatingClose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3 pt-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm">3. Storage & Food Handling Capabilities</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 bg-white">
                <input
                  type="checkbox"
                  checked={hasColdStorage}
                  onChange={(e) => setHasColdStorage(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="flex items-center gap-1.5">
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-slate-800">Commercial Cold Storage (≤ 4°C)</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 bg-white">
                <input
                  type="checkbox"
                  checked={hasReheatingFacility}
                  onChange={(e) => setHasReheatingFacility(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-slate-800">Commercial Reheating Kitchen</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Transport & Collection Option</label>
              <select
                value={transportationCapability}
                onChange={(e) => setTransportationCapability(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Both">Both Delivery & Volunteer Self-Pickup</option>
                <option value="Delivery-only">Delivery to Facility Only</option>
                <option value="Self-pickup">Volunteer Self-Pickup from Donor</option>
              </select>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="space-y-2 pt-2">
            <label className="block text-slate-700 font-semibold mb-1">Accepted Food Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allCategories.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleToggleCategory(cat)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="truncate">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Submit Recipient Request</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
