import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay?: number): T {
  let [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    let timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
