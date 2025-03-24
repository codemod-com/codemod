import type { Void } from "@studio/types/transformations";

export type VisibilityOptions = {
  toggleVisibility: Void;
  isVisible: boolean;
} & Record<"show" | "hide", Void>;
