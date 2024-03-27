import { VisibilityOptions } from "~/types/options";
import { isNil } from "~/utils/isNil";

export const isVisible = (
	visibility:
		| {
				visibilityOptions?: VisibilityOptions;
		  }
		| { isVisible: boolean },
) =>
	"visibilityOptions" in visibility && !isNil(visibility?.visibilityOptions)
		? visibility.visibilityOptions.isVisible
		: "isVisible" in visibility
		  ? visibility.isVisible
		  : true;
export const alwaysVisible: VisibilityOptions = {
	isVisible: true,
	toggleVisibility: () => true,
};
