import { useState } from 'react';
import { MapPin, Navigation, X, Check, Home, Briefcase, Bookmark, Loader2 } from 'lucide-react';
import { useLocation, POPULAR_CITIES } from '../../context/LocationContext';

export const LocationModal = ({ isOpen, onClose }) => {
  const {
    location,
    detectGPSLocation,
    selectCity,
    selectSavedAddress,
    savedAddresses,
    isLocating,
  } = useLocation();

  const [searchInput, setSearchInput] = useState('');

  if (!isOpen) return null;

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    c.state.toLowerCase().includes(searchInput.toLowerCase())
  );

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home className="w-4 h-4 text-[#14513F]" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-[#14513F]" />;
      default:
        return <Bookmark className="w-4 h-4 text-[#14513F]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#FFFDF8] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#E8ECE7] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#14513F]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#14513F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#27352F]">Choose Delivery Location</h3>
              <p className="text-xs text-[#737B76]">Showing homemade food & chefs serving your area</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#737B76] hover:bg-[#F7F8F5] transition-colors"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <button
          onClick={detectGPSLocation}
          disabled={isLocating}
          className="mt-4 flex items-center justify-between w-full p-3.5 rounded-xl bg-white border-2 border-[#14513F] text-[#14513F] hover:bg-[#14513F]/5 transition-all font-semibold text-sm shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            {isLocating ? (
              <Loader2 className="w-4 h-4 text-[#F6A23A] animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-[#F6A23A] group-hover:scale-110 transition-transform" />
            )}
            <span>{isLocating ? 'Detecting high-precision GPS...' : 'Use Current GPS Location'}</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F6A23A]/20 text-[#27352F]">
            Precise
          </span>
        </button>

        {/* Saved Addresses (if available) */}
        {savedAddresses && savedAddresses.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#737B76] mb-2">
              Saved Delivery Addresses
            </p>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {savedAddresses.map((addr) => {
                const isSelected = location.addressId === addr._id;
                return (
                  <button
                    key={addr._id}
                    onClick={() => selectSavedAddress(addr)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'border-[#14513F] bg-[#14513F]/10 text-[#27352F] font-semibold'
                        : 'border-[#E8ECE7] bg-white hover:border-[#14513F]/40'
                    }`}
                  >
                    <div className="mt-0.5">{getAddressIcon(addr.addressType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold capitalize text-[#27352F]">
                          {addr.addressType || 'Saved'}
                        </span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.2 bg-[#F6A23A]/20 text-[10px] text-[#27352F] font-semibold rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[#737B76] text-[11px] mt-0.5">
                        {addr.addressLine1 || addr.addressLine}, {addr.city} ({addr.pincode})
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#14513F] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search city (e.g. Lucknow, Varanasi, Kanpur)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-white text-sm text-[#27352F] placeholder-[#737B76] focus:outline-none focus:border-[#14513F] transition-colors"
          />
        </div>

        {/* Cities List */}
        <div className="mt-3 overflow-y-auto flex-1 space-y-1 pr-1 min-h-[140px]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#737B76] px-1 mb-2">
            Service Cities
          </p>
          {filteredCities.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#737B76]">
              No service city matching "{searchInput}". Please select from our active service hubs.
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected =
                !location.addressId &&
                location.city?.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => selectCity(city)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-[#14513F] text-white font-semibold'
                      : 'text-[#27352F] bg-white hover:bg-[#F7F8F5] border border-[#E8ECE7]/60'
                  }`}
                >
                  <div>
                    <span className="block leading-snug">{city.name}</span>
                    <span
                      className={`text-[11px] ${
                        isSelected ? 'text-white/80' : 'text-[#737B76]'
                      }`}
                    >
                      {city.state}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-2 border-t border-[#E8ECE7] text-center text-[11px] text-[#737B76]">
          GharKaSwad connects you with verified local home kitchens within a practical delivery radius.
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
