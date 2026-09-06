import { useState, useEffect } from 'react';

interface LocationState {
  city: string;
  state: string;
  lat: number;
  lng: number;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    city: 'Detecting...',
    state: '',
    lat: 0,
    lng: 0,
    loading: true,
    error: null,
  });

  const fetchLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      setLocation({
        city: 'Indore',
        state: 'MP',
        lat: 22.7196,
        lng: 75.8577,
        loading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Mocking reverse geocoding for speed, but using actual coordinates
          // In production, we'd use Google Maps Geocoding API
          setLocation({
            city: 'Indore', // Mocked City based on user prompt
            state: 'MP',
            lat: latitude,
            lng: longitude,
            loading: false,
            error: null,
          });
        } catch (error) {
          setLocation(prev => ({ ...prev, loading: false, error: 'Failed to fetch location name' }));
        }
      },
      (error) => {
        // Fallback to Indore as requested
        setLocation({
          city: 'Indore',
          state: 'MP',
          lat: 22.7196,
          lng: 75.8577,
          loading: false,
          error: error.message,
        });
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, fetchLocation };
}
