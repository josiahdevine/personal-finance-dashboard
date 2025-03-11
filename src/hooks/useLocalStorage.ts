import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for managing data in local storage with type safety
 * @param key The key to store the data under in local storage
 * @param initialValue The initial value to use if no value is found in local storage
 * @returns A tuple containing the stored value and functions to update and remove it
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error on server
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event('local-storage-change'));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from local storage
  const removeValue = useCallback(() => {
    try {
      // Remove from local storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event('local-storage-change'));
      }
      
      // Reset state to initial value
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    // Listen for localStorage changes across windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom localStorage change event
    const handleLocalChange = () => {
      setStoredValue(readValue());
    };
    
    window.addEventListener('local-storage-change', handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleLocalChange);
    };
  }, [key, readValue, initialValue]);

  return [storedValue, setValue, removeValue] as const;
} 