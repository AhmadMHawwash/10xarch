import { useEffect, useState } from "react";

const useLocalStorageState = <T>(
  key: string,
  defaultValue: T,
  deserializer?: (value: string | null) => T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      if (deserializer) {
        return deserializer(storedValue);
      } else {
        try {
          return JSON.parse(storedValue) as T;
        } catch (e) {
          console.error(`Error parsing localStorage value for key ${key}:`, e);
          return defaultValue;
        }
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Error stringifying state for key ${key}:`, e);
    }
  }, [key, state]);

  return [state, setState];
};

export default useLocalStorageState;
