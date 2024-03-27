import { VisibilityOptions } from "~/types/options";

export const isVisible = ({
	visibilityOptions,
}: {
	visibilityOptions?: VisibilityOptions;
}) => visibilityOptions?.isVisible ?? true;
export const alwaysVisible: VisibilityOptions = {
	isVisible: true,
	toggleVisibility: () => true,
};
