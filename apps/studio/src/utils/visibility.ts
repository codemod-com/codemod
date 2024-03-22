import { VisibilityOptions } from "~/types/options";

export const isVisible = (
	visibility:
		| {
				visibilityOptions?: VisibilityOptions;
		  }
		| { isVisible: boolean },
) =>
	"visibilityOptions" in visibility
		? visibility?.visibilityOptions?.isVisible
		: "isVisible" in visibility
		  ? visibility.isVisible
		  : true;
export const alwaysVisible: VisibilityOptions = {
	isVisible: true,
	toggleVisibility: () => true,
};
