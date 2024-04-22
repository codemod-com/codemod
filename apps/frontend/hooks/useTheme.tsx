export type Theme = "light" | "dark";

export const useTheme = () => {
	const setTheme = (newTheme: Theme, store = false): void => {
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(newTheme);
		store ? localStorage.setItem("theme", newTheme) : null;
	};

	return { setTheme };
};
