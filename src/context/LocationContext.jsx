import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { addressService } from '../services/addressService';

const LocationContext = createContext(null);

export const POPULAR_CITIES = [
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, pincode: '226001' },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, pincode: '221001' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, pincode: '208001' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, pincode: '452001' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, pincode: '211001' },
  { name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090, pincode: '110001' },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910, pincode: '201301' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, pincode: '273001' },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, pincode: '282001' },
  { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lng: 82.1998, pincode: '224123' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, pincode: '700001' },
];

export const DEFAULT_LOCATION = {
  city: 'Lucknow',
  displayName: 'Hazratganj, Lucknow',
  lat: 26.8467,
  lng: 80.9462,
  pincode: '226001',
  source: 'default',
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      const stored = localStorage.getItem('gks_location');
      return stored ? JSON.parse(stored) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const { info, error, success } = useToast();

  // Keep location in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gks_location', JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  // Fetch saved customer addresses if token exists
  const refreshAddresses = useCallback(async () => {
    const token = localStorage.getItem('gks_token');
    if (!token) {
      setSavedAddresses([]);
      return;
    }
    try {
      setIsLoadingAddresses(true);
      const res = await addressService.getAddresses();
      if (res && res.addresses) {
        setSavedAddresses(res.addresses);
      }
    } catch {
      // ignore if unauthenticated
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const updateLocation = (newLoc) => {
    setLocation((prev) => ({
      ...prev,
      ...newLoc,
    }));
  };

  // Select a predefined or searched city with known coordinates
  const selectCity = (cityObj) => {
    const newLoc = {
      city: cityObj.name,
      displayName: `${cityObj.name}, ${cityObj.state || 'India'}`,
      lat: cityObj.lat,
      lng: cityObj.lng,
      pincode: cityObj.pincode || '',
      source: 'city',
    };
    setLocation(newLoc);
    success(`Location changed to ${cityObj.name}`);
    setIsLocationModalOpen(false);
  };

  // Select one of user's saved addresses
  const selectSavedAddress = (addr) => {
    let lat = null;
    let lng = null;
    if (addr.location && Array.isArray(addr.location.coordinates) && addr.location.coordinates.length === 2) {
      // GeoJSON: [longitude, latitude]
      lng = addr.location.coordinates[0];
      lat = addr.location.coordinates[1];
    }

    const shortLabel = addr.addressType
      ? `${addr.addressType.toUpperCase()}: ${addr.city}`
      : `${addr.city}`;

    const newLoc = {
      city: addr.city,
      displayName: `${shortLabel} (${addr.pincode})`,
      lat: lat || location.lat,
      lng: lng || location.lng,
      pincode: addr.pincode,
      addressId: addr._id,
      source: 'saved',
    };
    setLocation(newLoc);
    success(`Delivering to ${addr.addressType || 'saved'} address in ${addr.city}`);
    setIsLocationModalOpen(false);
  };

  // Detect GPS location using browser Geolocation API
  const detectGPSLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    info('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        // Try to find closest known city for user-friendly name
        let nearestCity = 'Nearby';
        let minD = Infinity;
        POPULAR_CITIES.forEach((c) => {
          const d = Math.hypot(c.lat - latitude, c.lng - longitude);
          if (d < minD) {
            minD = d;
            nearestCity = c.name;
          }
        });

        const newLoc = {
          lat: latitude,
          lng: longitude,
          displayName: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (${nearestCity})`,
          city: nearestCity,
          source: 'gps',
        };
        setLocation(newLoc);
        success(`GPS location acquired (${nearestCity})`);
        setIsLocationModalOpen(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          error('Location permission was denied. Please select your city or saved address manually.');
        } else if (err.code === 2) {
          error('GPS position is currently unavailable. Please pick your city manually.');
        } else if (err.code === 3) {
          error('GPS request timed out. Please select your city manually.');
        } else {
          error('Unable to retrieve location. Please choose a city manually.');
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        updateLocation,
        detectGPSLocation,
        selectCity,
        selectSavedAddress,
        savedAddresses,
        isLoadingAddresses,
        refreshAddresses,
        isLocating,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
