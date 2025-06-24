import { useState, useEffect } from 'react';
import { Location } from '../types';

interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocationFromCoords = async (latitude: number, longitude: number): Promise<Location> => {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      return {
        city: data.city || data.locality || 'Unknown',
        country: data.countryName || 'Unknown',
        latitude,
        longitude
      };
    } catch (error) {
      // Fallback location data
      return {
        city: 'Unknown',
        country: 'Unknown',
        latitude,
        longitude
      };
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationData = await getLocationFromCoords(latitude, longitude);
          setLocation(locationData);
        } catch (err) {
          setError('Failed to get location information');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    // Auto-request location on mount
    requestLocation();
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation
  };
};