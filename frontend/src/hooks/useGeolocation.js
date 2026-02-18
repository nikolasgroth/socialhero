import { useState, useCallback, useRef } from 'react';
import { isNativePlatform } from '../utils/capacitor';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const watchRef = useRef(null);
  const watchIdRef = useRef(null);

  const getPosition = useCallback(async (highAccuracy = false) => {
    if (isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        setLoading(true);
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.location !== 'prompt') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            const err = new Error('Standortberechtigung wurde verweigert');
            setError(err.message);
            setLoading(false);
            throw err;
          }
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 10000 : 5000,
          maximumAge: highAccuracy ? 0 : 60000,
        });
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        setLoading(false);
        setError(null);
        return loc;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation wird nicht unterstützt');
        setError(err.message);
        reject(err);
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(loc);
          setLoading(false);
          setError(null);
          resolve(loc);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 10000 : 5000,
          maximumAge: highAccuracy ? 0 : 60000,
        }
      );
    });
  }, []);

  const startWatching = useCallback(async (onUpdate) => {
    if (isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') return;
        }
        watchIdRef.current = await Geolocation.watchPosition(
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 },
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setPosition(loc);
            if (onUpdate) onUpdate(loc);
          }
        );
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        if (onUpdate) onUpdate(loc);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  const stopWatching = useCallback(async () => {
    if (isNativePlatform()) {
      if (watchIdRef.current !== null) {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          await Geolocation.clearWatch({ id: watchIdRef.current });
        } catch {}
        watchIdRef.current = null;
      }
      return;
    }

    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  return { position, error, loading, getPosition, startWatching, stopWatching };
}
