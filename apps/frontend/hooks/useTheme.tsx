export type Theme = "light" | "dark";

export const useTheme = () => {
  const setTheme = (newTheme: Theme): void => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return { setTheme };
};
