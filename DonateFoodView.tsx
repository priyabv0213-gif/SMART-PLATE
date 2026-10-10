import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Sparkles,
  Info,
  ArrowRight,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, StorageCondition, DonorType } from '../../types';
import { STANDARD_SAFETY_RULES } from '../../data/safetyRules';
import { getFoodImage } from '../../data/foodImages';
import { findLocationById } from '../../data/locations';

export const DonateFoodView: React.FC = () => {
  const { addDonation, setActiveTab, selectedCity } = useApp();

  const cityObj = findLocationById(selectedCity);

  const [donorName, setDonorName] = useState('Annapoorna Gowrishankar Sweets & Restaurant');
  const [donorType, setDonorType] = useState<DonorType>('Restaurant');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('Cooked meals');
  const [description, setDescription] = useState('Hot Sambar Rice, Potato Poriyal, Rasam & Curd Rice (5 large containers)');
  const [quantity, setQuantity] = useState(80);
  const [unit, setUnit] = useState<'meals' | 'kg' | 'portions' | 'trays'>('meals');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('hot-holding');
  const [currentTempC, setCurrentTempC] = useState(65);
  const [safetyRuleId, setSafetyRuleId] = useState('FSSAI-SURPLUS-COOKED');
  const [safetyVerified, setSafetyVerified] = useState(true);
  const [locationAddress, setLocationAddress] = useState(
    selectedCity.toLowerCase().includes('coimbatore')
      ? '75 East Lokamanya St, RS Puram, Coimbatore, Tamil Nadu'
      : `${cityObj.popularLocalities?.[0] || 'Main Street'}, ${cityObj.displayName}`
  );
  const [pickupMinutes, setPickupMinutes] = useState(15);
  const [safeHours, setSafeHours] = useState(4);
  const [specialHandling, setSpecialHandling] = useState('Keep warm > 60°C, FSSAI sealed containers');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();

    // Pick authentic photo if no user image uploaded
    const photo = imagePreview || getFoodImage(description, foodCategory).imageUrl;

    addDonation({
      donorName,
      donorType,
      foodCategory,
      foodName: description.split('(')[0].trim(),
      description,
      quantity: Number(quantity),
      unit,
      preparedAt: new Date(now - 30 * 60000).toISOString(),
      storageCondition,
      currentTempC: Number(currentTempC),
      verifiedSafeDeadline: new Date(now + safeHours * 3600000).toISOString(),
      safetyRuleId,
      safetyVerified,
      city: cityObj.name,
      location: {
        lat: cityObj.lat + (Math.random() - 0.5) * 0.015,
        lng: cityObj.lng + (Math.random() - 0.5) * 0.015,
        name: donorName,
        address: locationAddress,
      },
      pickupReadinessTime: new Date(now + pickupMinutes * 60000).toISOString(),
      specialHandling: specialHandling.split(',').map((s) => s.trim()),
      status: safetyVerified ? 'Available' : 'Pending verification',
      imageUrl: photo,
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Donate Surplus Food</h1>
            <p className="text-xs text-slate-500">
              Register edible surplus from your kitchen in {selectedCity} for immediate redistribution
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          FSSAI Verified Gate
        </span>
      </div>

      {submittedSuccess ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-emerald-950">Surplus Batch Successfully Registered!</h2>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your donation has passed preliminary safety validation and is now visible to matched recipient organizations in {selectedCity}.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <span>Explore Food Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
          {/* Organization & Donor Details */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Donor & Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Donor Name / Business</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Annapoorna Restaurant RS Puram"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Donor Type</label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as DonorType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Hotel">Hotel / Banquet</option>
                  <option value="Supermarket">Supermarket / Retail</option>
                  <option value="Bakery">Bakery & Sweets</option>
                  <option value="Catering">Event Catering</option>
                  <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pickup Address ({selectedCity})</label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Street address for collection"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Food Details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Food Category & Quantity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Food Category</label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Cooked meals">Cooked meals (Meals / Thali)</option>
                  <option value="Rice & prepared dishes">Rice dishes (Biryani / Pulao)</option>
                  <option value="Bakery products">Bakery products & Savories</option>
                  <option value="Fruits & vegetables">Fresh Fruits & Vegetables</option>
                  <option value="Dairy & chilled">Dairy & Chilled (Curd / Milk / Paneer)</option>
                  <option value="Packaged food">Shelf-stable packaged items</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Available Quantity</label>
                <input
                  type="number"
                  min={5}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="meals">meals / portions</option>
                  <option value="kg">kg</option>
                  <option value="portions">portions</option>
                  <option value="trays">catering trays</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Food Description & Dish Details</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sambar rice, potato poriyal, curd rice, freshly prepared..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Food Safety & Safe-Use Window */}
          <div className="space-y-3 pt-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Food Safety & Verified Safe-Use Window</span>
              </h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyVerified}
                  onChange={(e) => setSafetyVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-bold text-emerald-900">Safety Certified for Human Consumption</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Regulatory Standard</label>
                <select
                  value={safetyRuleId}
                  onChange={(e) => setSafetyRuleId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  {STANDARD_SAFETY_RULES.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Safe Hours From Preparation</label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  max={48}
                  value={safeHours}
                  onChange={(e) => setSafeHours(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Storage Condition</label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  <option value="hot-holding">hot-holding (&gt; 60°C)</option>
                  <option value="refrigerated">refrigerated (&lt; 4°C)</option>
                  <option value="ambient">ambient dry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Holding Temp (°C)</label>
                <input
                  type="number"
                  value={currentTempC}
                  onChange={(e) => setCurrentTempC(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Optional Photo Upload */}
          <div className="space-y-2 pt-2">
            <label className="block text-slate-700 font-semibold mb-1">Food Photograph (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Upload Food Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={imagePreview} alt="Food batch preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              If no photo is uploaded, SmartPlate will automatically attach an authentic illustrative photo of {description.split('(')[0].trim() || 'the selected dish'}.
            </p>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Confirm & Register Donation</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
