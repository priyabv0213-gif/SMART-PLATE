import React, { useState } from 'react';
import {
  MapPin,
  Search,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Building2,
  ChevronRight,
  Compass,
} from 'lucide-react';
import {
  SUPPORTED_INDIAN_LOCATIONS,
  ALL_INDIA_OPTION,
  searchLocations,
  SupportedLocation,
  DEFAULT_LOCATION,
} from '../data/locations';
import { useApp } from '../context/AppContext';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedCity, setSelectedCity, donations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLocations = searchLocations(searchQuery);

  const getCityListingCount = (loc: SupportedLocation) => {
    if (loc.id === 'all_india') return donations.length;
    return donations.filter((d) => {
      const cityField = (d.city || '').toLowerCase();
      const addr = (d.location?.address || d.location?.name || d.pickupAddress || '').toLowerCase();
      const queryName = loc.name.toLowerCase();
      return cityField.includes(queryName) || addr.includes(queryName);
    }).length;
  };

  const handleSelect = (loc: SupportedLocation) => {
    setSelectedCity(loc.displayName);
    onClose();
  };

  const handleResetToCoimbatore = () => {
    setSelectedCity(DEFAULT_LOCATION.displayName);
    onClose();
  };

  const isSelected = (loc: SupportedLocation) => {
    if (loc.id === 'all_india') {
      return selectedCity.toLowerCase().includes('all india');
    }
    return selectedCity.toLowerCase().includes(loc.name.toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  Select Location in India
                </h2>
                <p className="text-xs text-slate-500">
                  Browse surplus food & rescue hubs across Indian cities
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search Indian city, state, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-slate-50/80 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Active: <strong className="text-slate-800">{selectedCity}</strong>
          </span>

          <button
            onClick={handleResetToCoimbatore}
            className="flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Coimbatore</span>
          </button>
        </div>

        {/* Locations List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[50vh]">
          {/* All India Option */}
          <div
            onClick={() => handleSelect(ALL_INDIA_OPTION)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              isSelected(ALL_INDIA_OPTION)
                ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSelected(ALL_INDIA_OPTION)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>All India (Nationwide Overview)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Pan-India
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Explore all active surplus donations and rescue missions across all states
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {donations.length} total
              </span>
              {isSelected(ALL_INDIA_OPTION) && (
                <Check className="w-4 h-4 text-emerald-600 font-bold" />
              )}
            </div>
          </div>

          <div className="pt-2 pb-1 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Supported Indian Cities & Hubs
            </span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs space-y-2">
              <p>No supported regions found matching "{searchQuery}".</p>
              <button
                onClick={handleResetToCoimbatore}
                className="text-orange-600 font-bold hover:underline"
              >
                Return to Coimbatore (Active Demo Hub)
              </button>
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const activeCount = getCityListingCount(loc);
              const selected = isSelected(loc);

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selected
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {loc.name}
                        </span>
                        <span className="text-[11px] text-slate-400">• {loc.state}</span>
                        {loc.isDemoHub && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-100 text-orange-700">
                            Demo Hub
                          </span>
                        )}
                      </div>

                      {loc.popularLocalities && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {loc.popularLocalities.slice(0, 4).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        activeCount > 0
                          ? 'bg-emerald-100 text-emerald-800 font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {activeCount > 0 ? `${activeCount} batches` : '0 listings'}
                    </span>

                    {selected ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Changing location updates available surplus food batches, recipient kitchens, and the rescue map.
        </div>
      </div>
    </div>
  );
};
