import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isNativePlatform } from '../utils/capacitor';
import { getLocationExplanationSeen, setLocationExplanationSeen } from '../utils/storage';

const LocationExplanationContext = createContext(null);

export function LocationExplanationProvider({ children }) {
  const [seen, setSeenState] = useState(null);

  useEffect(() => {
    if (!isNativePlatform()) {
      setSeenState(true);
      return;
    }
    getLocationExplanationSeen().then(setSeenState);
  }, []);

  const setSeen = useCallback(async (value = true) => {
    await setLocationExplanationSeen(value);
    setSeenState(value);
  }, []);

  const value = seen === null ? null : { seen, setSeen };

  return (
    <LocationExplanationContext.Provider value={value}>
      {children}
    </LocationExplanationContext.Provider>
  );
}

export function useLocationExplanation() {
  const ctx = useContext(LocationExplanationContext);
  return ctx ?? { seen: null, setSeen: () => {} };
}
