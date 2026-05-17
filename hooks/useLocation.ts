import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export function useLocation(continuous = false) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startTracking = async () => {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setError('Location unavailable');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Your location' });
          },
          () => setError('Location unavailable — enable in settings'),
        );
        return;
      }

      try {
        const ExpoLocation = await import('expo-location');
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location unavailable — enable in settings');
          return;
        }
        const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
        if (cancelled) return;

        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Fetching address...',
        });

        try {
          const geocode = await ExpoLocation.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (geocode.length > 0 && !cancelled) {
            const g = geocode[0];
            const parts = [g.street, g.city, g.region].filter(Boolean);
            setLocation((prev) =>
              prev ? { ...prev, address: parts.join(', ') || 'Your location' } : prev,
            );
          }
        } catch {
          // ignore geocode failure
        }

        if (continuous) {
          const sub = await ExpoLocation.watchPositionAsync(
            { accuracy: ExpoLocation.Accuracy.High, timeInterval: 10000, distanceInterval: 20 },
            (p) => {
              if (!cancelled) {
                setLocation((prev) => prev ? { ...prev, lat: p.coords.latitude, lng: p.coords.longitude } : prev);
              }
            },
          );
          watchRef.current = sub;
        }
      } catch {
        setError('Location unavailable — enable in settings');
      }
    };

    startTracking();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
    };
  }, [continuous]);

  return { location, error };
}
