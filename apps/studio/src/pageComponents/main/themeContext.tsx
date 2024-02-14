'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
	type ReactNode,
} from 'react';

const ThemeContext = createContext<{
	isDark: boolean | null;
	toggleTheme: () => void;
}>({
	isDark: null,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	toggleTheme: () => {},
});
const THEME_CONST = '_THEME_';
const LIGHT = 'light';
const DARK = 'dark';

const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [isDark, setDarkTheme] = useState<boolean | null>(null);

	useLayoutEffect(() => {
		const storedTheme = localStorage.getItem(THEME_CONST);
		const foundTheme =
			storedTheme ?? (isBrowserSchemeDark() ? DARK : LIGHT);
		setDarkTheme(foundTheme === DARK);
	}, []);

	useEffect(() => {
		if (isDark === null) {
			return;
		}
		if (isDark) {
			localStorage.setItem(THEME_CONST, DARK);
			document.documentElement.classList.add(DARK);
			document.body.classList.add('bg-gray-darker');
		} else {
			localStorage.setItem(THEME_CONST, LIGHT);
			document.documentElement.classList.remove(DARK);
			document.body.classList.remove('bg-gray-darker');
			document.body.classList.add('bg-gray-bg-light');
		}
	}, [isDark]);

	const toggleTheme = useCallback(() => {
		setDarkTheme(!isDark);
	}, [setDarkTheme, isDark]);

	return (
		<ThemeContext.Provider value={{ isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

const isBrowserSchemeDark = () =>
	window.matchMedia &&
	window.matchMedia('(prefers-color-scheme: dark)').matches;

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };
