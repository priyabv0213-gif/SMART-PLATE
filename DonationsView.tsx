import React, { useState } from 'react';
import {
  Plus,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Thermometer,
  Trash2,
  Edit2,
  Filter,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, StorageCondition, DonorType, FoodDonation } from '../../types';
import { STANDARD_SAFETY_RULES } from '../../data/safetyRules';

export const DonationsView: React.FC = () => {
  const { donations, addDonation, updateDonation, cancelDonation, currentPlan } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<FoodDonation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State
  const [donorName, setDonorName] = useState('');
  const [donorType, setDonorType] = useState<DonorType>('Restaurant');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('Cooked meals');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState<'meals' | 'kg' | 'portions' | 'trays'>('meals');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('hot-holding');
  const [currentTempC, setCurrentTempC] = useState<number>(62);
  const [safetyRuleId, setSafetyRuleId] = useState(STANDARD_SAFETY_RULES[0].id);
  const [safetyVerified, setSafetyVerified] = useState(true);
  const [locationName, setLocationName] = useState('Central Kitchen 1');
  const [locationAddress, setLocationAddress] = useState('120 5th Ave, New York, NY');
  const [pickupMinutesFromNow, setPickupMinutesFromNow] = useState(15);
  const [safeHoursFromPrep, setSafeHoursFromPrep] = useState(4);
  const [specialHandlingStr, setSpecialHandlingStr] = useState('Keep warm > 60°C, Insulated thermal container');

  const openCreateModal = () => {
    setEditingDonation(null);
    setDonorName('');
    setDonorType('Restaurant');
    setFoodCategory('Cooked meals');
    setDescription('');
    setQuantity(50);
    setUnit('meals');
    setStorageCondition('hot-holding');
    setCurrentTempC(62);
    setSafetyRuleId(STANDARD_SAFETY_RULES[0].id);
    setSafetyVerified(true);
    setLocationName('Midtown Grand Cafe');
    setLocationAddress('350 5th Ave, New York, NY');
    setPickupMinutesFromNow(15);
    setSafeHoursFromPrep(4);
    setSpecialHandlingStr('Keep warm > 60°C');
    setIsModalOpen(true);
  };

  const openEditModal = (d: FoodDonation) => {
    setEditingDonation(d);
    setDonorName(d.donorName);
    setDonorType(d.donorType);
    setFoodCategory(d.foodCategory);
    setDescription(d.description);
    setQuantity(d.quantity);
    setUnit(d.unit);
    setStorageCondition(d.storageCondition);
    setCurrentTempC(d.currentTempC || 20);
    setSafetyRuleId(d.safetyRuleId);
    setSafetyVerified(d.safetyVerified);
    setLocationName(d.location.name || '');
    setLocationAddress(d.location.address || '');
    setPickupMinutesFromNow(15);
    setSpecialHandlingStr(d.specialHandling.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const pickupTime = new Date(now + pickupMinutesFromNow * 60000).toISOString();
    const verifiedSafeDeadline = new Date(now + safeHoursFromPrep * 3600000).toISOString();

    const specialHandling = specialHandlingStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingDonation) {
      updateDonation({
        ...editingDonation,
        donorName,
        donorType,
        foodCategory,
        description,
        quantity: Number(quantity),
        unit,
        storageCondition,
        currentTempC: Number(currentTempC),
        safetyRuleId,
        safetyVerified,
        verifiedSafeDeadline,
        pickupReadinessTime: pickupTime,
        location: {
          ...editingDonation.location,
          name: locationName,
          address: locationAddress,
        },
        specialHandling,
        status: safetyVerified ? 'Available' : 'Pending verification',
      });
    } else {
      addDonation({
        donorName,
        donorType,
        foodCategory,
        description,
        quantity: Number(quantity),
        unit,
        preparedAt: new Date(now - 30 * 60000).toISOString(),
        storageCondition,
        currentTempC: Number(currentTempC),
        verifiedSafeDeadline,
        safetyRuleId,
        safetyVerified,
        location: {
          lat: 40.75 + (Math.random() - 0.5) * 0.05,
          lng: -73.98 + (Math.random() - 0.5) * 0.05,
          name: locationName,
          address: locationAddress,
        },
        pickupReadinessTime: pickupTime,
        specialHandling,
        status: safetyVerified ? 'Available' : 'Pending verification',
      });
    }
    setIsModalOpen(false);
  };

  const filteredDonations = donations.filter((d) => {
    if (filterCategory !== 'All' && d.foodCategory !== filterCategory) return false;
    if (filterStatus !== 'All' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Food Donation Register</h2>
            <p className="text-xs text-slate-500">
              {donations.length} registered batches with verified safe-use deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Cooked meals">Cooked meals</option>
            <option value="Rice & prepared dishes">Rice & prepared dishes</option>
            <option value="Bakery products">Bakery products</option>
            <option value="Fruits & vegetables">Fruits & vegetables</option>
            <option value="Dairy & chilled">Dairy & chilled</option>
            <option value="Packaged food">Packaged food</option>
          </select>

          {/* Filter status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Pending verification">Pending verification</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Surplus</span>
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Batch ID & Donor</th>
                <th className="py-3 px-4">Category & Quantity</th>
                <th className="py-3 px-4">Storage & Temp</th>
                <th className="py-3 px-4">Safety Rule & Deadline</th>
                <th className="py-3 px-4">Pickup Readiness</th>
                <th className="py-3 px-4">Status & Allocation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No donations found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => {
                  const deadlineDate = new Date(d.verifiedSafeDeadline);
                  const minutesLeft = Math.floor((deadlineDate.getTime() - Date.now()) / 60000);
                  const isExpiringSoon = minutesLeft > 0 && minutesLeft < 60;
                  const isExpired = minutesLeft <= 0;

                  // Find active assignment
                  const assignment = currentPlan?.assignments.find((a) => a.donationId === d.id);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Donor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{d.donorName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-slate-400">{d.id}</span>
                          <span>•</span>
                          <span className="text-slate-600">{d.donorType}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {d.location.address}
                        </div>
                      </td>

                      {/* Category & Quantity */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                          {d.foodCategory}
                        </span>
                        <div className="font-bold text-emerald-700 text-sm mt-1">
                          {d.quantity} {d.unit}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{d.description}</p>
                      </td>

                      {/* Storage & Temp */}
                      <td className="py-3 px-4">
                        <div className="capitalize font-medium text-slate-800">{d.storageCondition}</div>
                        {d.currentTempC !== undefined && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                            <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                            <span>{d.currentTempC}°C</span>
                          </div>
                        )}
                        {d.specialHandling.length > 0 && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                            {d.specialHandling[0]}
                          </div>
                        )}
                      </td>

                      {/* Safety Rule & Deadline */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {d.safetyVerified ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3 text-red-600" /> Verification Needed
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 mt-1">
                          {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          className={`text-[10px] font-bold mt-0.5 ${
                            isExpired
                              ? 'text-red-600'
                              : isExpiringSoon
                              ? 'text-amber-600 animate-pulse'
                              : 'text-slate-500'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m safe margin`}
                        </div>
                      </td>

                      {/* Pickup Readiness */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(d.pickupReadinessTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">Ready for dispatch</span>
                      </td>

                      {/* Status & Allocation */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            d.status === 'Available'
                              ? 'bg-blue-50 text-blue-700'
                              : d.status === 'Allocated'
                              ? 'bg-emerald-50 text-emerald-700'
                              : d.status === 'Pending verification'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {assignment ? 'Allocated' : d.status}
                        </span>
                        {assignment && (
                          <div className="text-[11px] text-slate-600 mt-1 font-medium">
                            To: <span className="text-slate-900 font-semibold">{assignment.recipientName}</span>
                            {assignment.isSplit && (
                              <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 px-1 py-0.2 rounded font-bold">
                                SPLIT
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(d)}
                            title="Edit donation"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => cancelDonation(d.id)}
                            title="Cancel donation"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Register / Edit Donation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDonation ? 'Edit Food Donation Batch' : 'Register Surplus Food Donation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Donor Business Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Grand Bistro"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Donor Type</label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value as DonorType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Catering">Catering</option>
                    <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Food Category</label>
                  <select
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Cooked meals">Cooked meals</option>
                    <option value="Rice & prepared dishes">Rice & prepared dishes</option>
                    <option value="Bakery products">Bakery products</option>
                    <option value="Fruits & vegetables">Fruits & vegetables</option>
                    <option value="Dairy & chilled">Dairy & chilled</option>
                    <option value="Packaged food">Packaged food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="meals">meals</option>
                    <option value="kg">kg</option>
                    <option value="portions">portions</option>
                    <option value="trays">trays</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Batch Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Roasted chicken trays, quinoa bowls, bread rolls..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Food Safety & Standard Rules Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Food Safety Compliance Standard
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyVerified}
                      onChange={(e) => setSafetyVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-slate-700 font-medium">Certified Safe for Human Consumption</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Applicable Regulatory Standard</label>
                    <select
                      value={safetyRuleId}
                      onChange={(e) => setSafetyRuleId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
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
                      min={0.5}
                      max={72}
                      value={safeHoursFromPrep}
                      onChange={(e) => setSafeHoursFromPrep(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Storage Condition</label>
                    <select
                      value={storageCondition}
                      onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    >
                      <option value="hot-holding">hot-holding (&gt; 60°C)</option>
                      <option value="refrigerated">refrigerated (&lt; 5°C)</option>
                      <option value="ambient">ambient dry</option>
                      <option value="frozen">frozen (&lt; -18°C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Holding Temp (°C)</label>
                    <input
                      type="number"
                      value={currentTempC}
                      onChange={(e) => setCurrentTempC(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Readiness */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pickup Address</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ready for Pickup (in Mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={pickupMinutesFromNow}
                    onChange={(e) => setPickupMinutesFromNow(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Special Handling Instructions</label>
                <input
                  type="text"
                  value={specialHandlingStr}
                  onChange={(e) => setSpecialHandlingStr(e.target.value)}
                  placeholder="e.g. Keep warm > 60°C, Fragile container, Allergen labeled"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingDonation ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
