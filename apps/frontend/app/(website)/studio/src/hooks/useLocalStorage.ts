import type { ToVoid } from "@studio/types/transformations";
import { useState } from "react";

export let useLocalStorage = <T = string | null>(
  key: string,
): [T | null, ToVoid<T | null>, VoidFunction] => {
  let localStorageValue = localStorage.getItem(key) as T | null;
  let [state, _setState] = useState<T | null>(localStorageValue);
  let setState = (x: T | null) => {
    x !== null
      ? localStorage.setItem(
          key,
          x instanceof Object ? JSON.stringify(x) : String(x),
        )
      : localStorage.removeItem(key);
    _setState(x);
  };
  let clear = () => setState(null);
  return [state, setState, clear];
};
