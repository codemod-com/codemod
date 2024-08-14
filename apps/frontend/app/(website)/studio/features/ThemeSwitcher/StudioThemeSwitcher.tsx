import { setMode } from "@features/ThemeSwitcher/setMode";
import { Moon, Sun } from "@phosphor-icons/react";
import { IconButton } from "@studio/components/button/IconButton";
import { useEffect, useState } from "react";

export const StudioThemeSwitcher = () => {
  const [isLight, setIsLight] = useState<boolean>(true);

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
