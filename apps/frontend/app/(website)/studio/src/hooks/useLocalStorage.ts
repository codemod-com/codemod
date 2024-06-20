import type { ToVoid } from "@studio/types/transformations";
import { useState } from "react";

export const useLocalStorage = <T = string | null>(
	key: string,
): [T | null, ToVoid<T | null>, VoidFunction] => {
	const localStorageValue = localStorage.getItem(key) as T | null;
	const [state, _setState] = useState<T | null>(localStorageValue);
	const setState = (x: T | null) => {
		x !== null
			? localStorage.setItem(
				key,
				x instanceof Object ? JSON.stringify(x) : String(x),
			)
			: localStorage.removeItem(key);
		_setState(x);
	};
	const clear = () => setState(null);
	return [state, setState, clear];
};
