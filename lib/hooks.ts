import { useState, useEffect } from "react";

function setItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
}

function getItem(key: string) {
  if (typeof window === "undefined") return;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.error("Error reading from localStorage", error);
  }
}

function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    return getItem(key) ?? initialValue;
  });

  useEffect(() => {
    setItem(key, state);
  }, [key, state]);

  return [state, setState] as const;
}

export default usePersistedState;
