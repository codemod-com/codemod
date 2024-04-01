import { Void } from "~/types/transformations";

export type VisibilityOptions = {
	toggleVisibility: Void;
	isVisible: boolean;
} & Record<"show" | "hide", Void>;
