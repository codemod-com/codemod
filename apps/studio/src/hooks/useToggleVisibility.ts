import { useState } from "react";
import { VisibilityOptions } from "~/types/options";

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
