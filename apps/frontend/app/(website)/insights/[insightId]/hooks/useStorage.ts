import { useEffect, useState } from "react";

interface DashboardComponentData<T> {
  name: string;
  data: T;
  componentName: string;
  config: any;
}

function useStorage<T>(
  name: string,
  componentName: string,
  initialData: T,
  initialConfig?: any,
): [T, (data: T) => void] {
  const storageKey = `${name}-${componentName}`;

  const [state, setState] = useState<T>(() => {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      try {
        return JSON.parse(storedData).data;
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }
    return initialData;
  });

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) {
      const initialState: DashboardComponentData<T> = {
        name,
        data: initialData,
        componentName,
        config: initialConfig,
      };
      localStorage.setItem(storageKey, JSON.stringify(initialState));
    }
  }, [name, componentName, initialData, initialConfig, storageKey]);

  const setStorage = (newData: T) => {
    setState(newData);
    const updatedState: DashboardComponentData<T> = {
      name,
      data: newData,
      componentName,
      config: initialConfig,
    };
    localStorage.setItem(storageKey, JSON.stringify(updatedState));
  };

  return [state, setStorage];
}

export default useStorage;
