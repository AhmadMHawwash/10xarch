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
        return JSON.parse(storedValue) as T;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default useLocalStorageState;
