import { type HighlightedCode, highlight } from "codehike/code";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  CODE_STEP_1,
  CODE_STEP_2,
  CODE_STEP_3,
  JSON_STEP_1,
  JSON_STEP_2,
} from "./CodeSwitcher/constants";

// Custom hook for theme detection (moved to a shared hook for reusability)
function useThemeDetector(): "dark" | "light" | null {
  const [theme, setTheme] = useState<"dark" | "light" | null>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme;
      }
    }
    return null;
  });

  useLayoutEffect(() => {
    if (typeof document !== "undefined") {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");

      const observer = new MutationObserver(() => {
        const isLight = document.documentElement.classList.contains("light");
        setTheme(isLight ? "light" : "dark");
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }
  }, []);

  return theme;
}

// Custom Hook: Fetch Highlights
const useHighlights = () => {
  const [infos, setInfos] = useState<HighlightedCode[]>([]);
  const [jsonInfos, setJsonInfos] = useState<HighlightedCode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useThemeDetector();

  const fetchHighlights = useCallback(async () => {
    if (!theme) return;

    const tsCodeBlocks = [CODE_STEP_1, CODE_STEP_2, CODE_STEP_3];
    const jsonCodeBlocks = [JSON_STEP_1, JSON_STEP_2];
    const palette = theme === "dark" ? "github-dark" : "github-light";

    try {
      const tsResults = await Promise.all(
        tsCodeBlocks.map((code) =>
          highlight({ lang: "ts", value: code, meta: "" }, palette),
        ),
      );

      const jsonResults = await Promise.all(
        jsonCodeBlocks.map((code) =>
          highlight({ lang: "json", value: code, meta: "" }, palette),
        ),
      );

      setInfos(tsResults);
      setJsonInfos(jsonResults);
    } catch (error) {
      console.error("Error fetching highlights:", error);
    } finally {
      setLoading(false);
    }
  }, [theme]);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      fetchHighlights();
    }, 300); // Adjust debounce delay as necessary

    return () => clearTimeout(timer);
  }, [fetchHighlights]);

  return { infos, jsonInfos, loading };
};

const useAnimationControl = (isAnimating: boolean) => {
  const next = (callback?: () => void) => {
    if (!isAnimating) return;

    if (callback) callback();
  };

  return { next };
};

export default useAnimationControl;
export { useThemeDetector, useHighlights, useAnimationControl };
