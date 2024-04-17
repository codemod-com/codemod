import type { VisibilityOptions } from "@studio/types/options";
import { useState } from "react";

export const useToggleVisibility = (initialValue = true): VisibilityOptions => {
	const [isVisible, setIsVisible] = useState(initialValue);
	return {
		isVisible,
		show: () => setIsVisible(true),
		hide: () => setIsVisible(false),
		toggleVisibility: () => {
			setIsVisible((prev) => !prev);
		},
	};
};
