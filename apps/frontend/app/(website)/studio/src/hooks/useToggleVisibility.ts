import type { VisibilityOptions } from "@studio/types/options";
import { useState } from "react";

export let useToggleVisibility = (initialValue = true): VisibilityOptions => {
  let [isVisible, setIsVisible] = useState(initialValue);
  return {
    isVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggleVisibility: () => {
      setIsVisible((prev) => !prev);
    },
  };
};
