import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Like useState, but persists to localStorage under the given key.
 * Supports both direct values and updater functions, just like useState.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved != null) return JSON.parse(saved) as T;
    } catch { /* ignore */ }
    return initial;
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota errors */ }
  }, [key, value]);

  return [value, setValue];
}
