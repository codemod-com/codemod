import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export let useTheme = () => {
  let [theme, _setTheme] = useState<Theme>();
  let oppositeTheme = theme === "light" ? "dark" : "light";

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
  let setTheme = (newTheme: Theme, store = false): void => {
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
