import React, { useState } from 'react';
import {
  Plus,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Snowflake,
  Flame,
  Truck,
  Edit2,
  Power,
  Users,
  X,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipient, RecipientType, FoodCategory } from '../../types';

export const RecipientsView: React.FC = () => {
  const { recipients, addRecipient, updateRecipient, toggleRecipientActive, currentPlan } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<RecipientType>('Community Kitchen');
  const [address, setAddress] = useState('240 Broadway, New York, NY');
  const [demandQuantity, setDemandQuantity] = useState(60);
  const [maxReceivingCapacity, setMaxReceivingCapacity] = useState(80);
  const [operatingOpen, setOperatingOpen] = useState('08:00');
  const [operatingClose, setOperatingClose] = useState('21:00');
  const [minAcceptableQuantity, setMinAcceptableQuantity] = useState(10);
  const [maxAcceptableQuantity, setMaxAcceptableQuantity] = useState(100);
  const [hasColdStorage, setHasColdStorage] = useState(true);
  const [hasReheatingFacility, setHasReheatingFacility] = useState(true);
  const [transportationCapability, setTransportationCapability] = useState<'Self-pickup' | 'Delivery-only' | 'Both'>(
    'Both'
  );
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([
    'Cooked meals',
    'Rice & prepared dishes',
  ]);

  const allCategories: FoodCategory[] = [
    'Cooked meals',
    'Rice & prepared dishes',
    'Bakery products',
    'Fruits & vegetables',
    'Dairy & chilled',
    'Packaged food',
  ];

  const openCreateModal = () => {
    setEditingRecipient(null);
    setName('');
    setType('Community Kitchen');
    setAddress('150 Grand St, New York, NY');
    setDemandQuantity(60);
    setMaxReceivingCapacity(80);
    setOperatingOpen('08:00');
    setOperatingClose('21:00');
    setMinAcceptableQuantity(10);
    setMaxAcceptableQuantity(100);
    setHasColdStorage(true);
    setHasReheatingFacility(true);
    setTransportationCapability('Both');
    setSelectedCategories(['Cooked meals', 'Rice & prepared dishes', 'Bakery products']);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipient) => {
    setEditingRecipient(r);
    setName(r.name);
    setType(r.type);
    setAddress(r.location.address || '');
    setDemandQuantity(r.demandQuantity);
    setMaxReceivingCapacity(r.maxReceivingCapacity);
    setOperatingOpen(r.operatingHours.open);
    setOperatingClose(r.operatingHours.close);
    setMinAcceptableQuantity(r.minAcceptableQuantity);
    setMaxAcceptableQuantity(r.maxAcceptableQuantity);
    setHasColdStorage(r.hasColdStorage);
    setHasReheatingFacility(r.hasReheatingFacility);
    setTransportationCapability(r.transportationCapability);
    setSelectedCategories(r.acceptedCategories);
    setIsModalOpen(true);
  };

  const handleToggleCategory = (cat: FoodCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecipient) {
      updateRecipient({
        ...editingRecipient,
        name,
        type,
        location: {
          ...editingRecipient.location,
          address,
        },
        demandQuantity: Number(demandQuantity),
        maxReceivingCapacity: Number(maxReceivingCapacity),
        currentStorageCapacity: Number(maxReceivingCapacity),
        operatingHours: { open: operatingOpen, close: operatingClose },
        minAcceptableQuantity: Number(minAcceptableQuantity),
        maxAcceptableQuantity: Number(maxAcceptableQuantity),
        hasColdStorage,
        hasReheatingFacility,
        transportationCapability,
        acceptedCategories: selectedCategories,
      });
    } else {
      addRecipient({
        name,
        type,
        location: {
          lat: 40.73 + (Math.random() - 0.5) * 0.06,
          lng: -73.98 + (Math.random() - 0.5) * 0.06,
          name,
          address,
        },
        demandQuantity: Number(demandQuantity),
        maxReceivingCapacity: Number(maxReceivingCapacity),
        currentStorageCapacity: Number(maxReceivingCapacity),
        operatingHours: { open: operatingOpen, close: operatingClose },
        minAcceptableQuantity: Number(minAcceptableQuantity),
        maxAcceptableQuantity: Number(maxAcceptableQuantity),
        hasColdStorage,
        hasReheatingFacility,
        transportationCapability,
        acceptedCategories: selectedCategories,
        active: true,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Recipient Organizations</h2>
            <p className="text-xs text-slate-500">
              {recipients.length} community centers, food banks & homeless shelters
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recipient</span>
        </button>
      </div>

      {/* Recipient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipients.map((r) => {
          // Calculate currently allocated meals from active plan
          const allocatedMeals = currentPlan?.assignments
            .filter((a) => a.recipientId === r.id)
            .reduce((sum, a) => sum + a.allocatedQuantity, 0) || 0;

          const loadPercent = Math.min(100, Math.round((allocatedMeals / r.maxReceivingCapacity) * 100));
          const demandPercent = Math.min(100, Math.round((allocatedMeals / r.demandQuantity) * 100));

          return (
            <div
              key={r.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-2xs relative flex flex-col justify-between ${
                r.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 bg-slate-50/70 opacity-70'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-400">{r.id}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">{r.type}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {r.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{r.location.address || 'Central Metro Location'}</span>
                </p>

                {/* Demand & Capacity Bars */}
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 font-medium mb-1">
                      <span>Demand Fulfillment</span>
                      <span className="font-bold text-slate-900">
                        {allocatedMeals} / {r.demandQuantity} meals ({demandPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${demandPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 font-medium mb-1">
                      <span>Receiving Capacity</span>
                      <span className="font-bold text-slate-900">
                        {allocatedMeals} / {r.maxReceivingCapacity} max ({loadPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          loadPercent >= 90 ? 'bg-red-500' : loadPercent >= 60 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Capabilities & Operating Hours */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {r.operatingHours.open} - {r.operatingHours.close}
                  </span>

                  {r.hasColdStorage ? (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                      <Snowflake className="w-3 h-3 text-blue-500" /> Cold Storage
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded">No Cold Chain</span>
                  )}

                  {r.hasReheatingFacility && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                      <Flame className="w-3 h-3 text-amber-500" /> Reheating
                    </span>
                  )}

                  <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    <Truck className="w-3 h-3 text-slate-500" /> {r.transportationCapability}
                  </span>
                </div>

                {/* Accepted Categories */}
                <div className="mb-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Accepted Categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {r.acceptedCategories.map((cat) => (
                      <span key={cat} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400">
                  History: {r.historicalStats.fulfilledMeals} meals fulfilled
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleRecipientActive(r.id)}
                    className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1 font-semibold ${
                      r.active
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={r.active ? 'Deactivate Recipient' : 'Activate Recipient'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{r.active ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                    title="Edit Recipient"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipient Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecipient ? 'Edit Recipient Organization' : 'Register New Recipient'}
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
                  <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hope Community Kitchen"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Organization Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RecipientType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Community Kitchen">Community Kitchen</option>
                    <option value="Food Bank">Food Bank</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Homeless Outreach">Homeless Outreach</option>
                    <option value="Youth Center">Youth Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Demanded Quantity (meals)</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={demandQuantity}
                    onChange={(e) => setDemandQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Receiving Capacity</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={maxReceivingCapacity}
                    onChange={(e) => setMaxReceivingCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operating Hours Open</label>
                  <input
                    type="time"
                    required
                    value={operatingOpen}
                    onChange={(e) => setOperatingOpen(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operating Hours Close</label>
                  <input
                    type="time"
                    required
                    value={operatingClose}
                    onChange={(e) => setOperatingClose(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block mb-1">Handling Capabilities & Transport</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasColdStorage}
                      onChange={(e) => setHasColdStorage(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-slate-700 font-medium">Refrigerated Cold Storage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReheatingFacility}
                      onChange={(e) => setHasReheatingFacility(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-slate-700 font-medium">Commercial Reheating Kitchen</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-slate-600 font-medium mb-1">Transport Capability</label>
                  <select
                    value={transportationCapability}
                    onChange={(e) => setTransportationCapability(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="Both">Both Delivery & Self-Pickup</option>
                    <option value="Delivery-only">Delivery-only</option>
                    <option value="Self-pickup">Self-pickup</option>
                  </select>
                </div>
              </div>

              {/* Accepted Food Categories checkboxes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Accepted Food Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedCategories.includes(cat)
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleToggleCategory(cat)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="truncate">{cat}</span>
                    </label>
                  ))}
                </div>
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
                  {editingRecipient ? 'Save Changes' : 'Confirm Recipient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
