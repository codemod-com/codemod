"use client";

import { createContext, type ReactNode, useContext, } from "react";

const UseTheme = createContext<{
	isDark: boolean | null;
	toggleTheme: () => void;
}>({
	isDark: null,
	toggleTheme: () => {
	},
});
// const THEME_CONST = "_THEME_";
// const LIGHT = "light";
// const DARK = "dark";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
	// const [isDark, setDarkTheme] = useState<boolean | null>(null);

	// useLayoutEffect(() => {
	//   const storedTheme = localStorage.getItem(THEME_CONST);
	//   const foundTheme = storedTheme ?? (isBrowserSchemeDark() ? DARK : LIGHT);
	//   setDarkTheme(foundTheme === DARK);
	// }, []);

	// useEffect(() => {
	//   if (isDark === null) {
	//     return;
	//   }
	//   if (isDark) {
	//     localStorage.setItem(THEME_CONST, DARK);
	//     document.documentElement.classList.add(DARK);
	//     document.body.classList.add("bg-gray-darker");
	//   } else {
	//     localStorage.setItem(THEME_CONST, LIGHT);
	//     document.documentElement.classList.remove(DARK);
	//     document.body.classList.remove("bg-gray-darker");
	//     document.body.classList.add("bg-gray-bg-light");
	//   }
	// }, [isDark]);

	// const toggleTheme = useCallback(() => {
	//   setDarkTheme(!isDark);
	// }, [setDarkTheme, isDark]);

	return (
		<UseTheme.Provider value={ {
			isDark: false, toggleTheme: () => {
			}
		} }>
			{ children }
		</UseTheme.Provider>
	);
};

// const isBrowserSchemeDark = () =>
//   window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const useTheme = () => useContext(UseTheme);

export { ThemeProvider, useTheme };
