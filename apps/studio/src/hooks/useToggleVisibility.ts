import { useState } from "react";
import { VisibilityOptions } from "~/types/options";
import { Void } from "~/types/transformations";

export const useToggleVisibility = (
	initialValue = true,
): VisibilityOptions & Record<"show" | "hide", Void> => {
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
