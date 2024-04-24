import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const useTheme = () => {
	const [theme, _setTheme] = useState<Theme>();
	const oppositeTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		if (theme) {
			document.documentElement.classList.remove("light", "dark");
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
