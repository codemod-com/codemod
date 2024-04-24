import { useEffect, useLayoutEffect, useState } from "react";

export type Theme = "light" | "dark";

const isBrowserSchemeDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export const useTheme = () => {
  const [theme, _setTheme] = useState<Theme>();
  const oppositeTheme = theme === "light" ? "dark" : "light";

  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const foundTheme = (storedTheme ??
      (isBrowserSchemeDark() ? "dark" : "light")) as Theme;
    setTheme(foundTheme, true);
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.remove("light", "dark");
      document.body.classList.remove("bg-gray-darker", "bg-gray-bg-light");
      document.documentElement.classList.add(theme);
    } else {
      _setTheme((localStorage.getItem("theme") as Theme) || "light");
      return;
    }
  }, [theme]);
  const setTheme = (newTheme: Theme, store = false): void => {
    _setTheme(newTheme);
    store ? localStorage.setItem("theme", newTheme) : null;
  };

  return {
    setTheme,
    theme,
    isDark: theme === "dark",
    toggleTheme: () => setTheme(oppositeTheme),
  };
};
