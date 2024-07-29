import { useTheme } from "@/hooks/useTheme";
import { setMode } from "@features/ThemeSwitcher/setMode";
import { Moon, Sun } from "@phosphor-icons/react";
import { IconButton } from "@studio/components/button/IconButton";
import { useEffect, useState } from "react";

export const StudioThemeSwitcher = () => {
  const globalTheme = useTheme();
  const [isLight, setIsLight] = useState<boolean>();

  useEffect(() => {
    setIsLight(globalTheme.theme === "light");
  }, [globalTheme.theme]);

  useEffect(() => {
    setMode(isLight);
  }, [isLight]);

  const toggleTheme = () => setIsLight((s) => !s);

  return (
    <IconButton
      Icon={isLight ? Sun : Moon}
      text="Theme"
      onClick={toggleTheme}
      hint="Change theme"
    />
  );
};
