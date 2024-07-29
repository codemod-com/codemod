import { addCSS } from "@features/ThemeSwitcher/addCSS";

export function setMode(isLight: boolean) {
  const darkModeCSS = `
        html {
            filter: invert(1) hue-rotate(180deg);
        }
        img, video {
            filter: invert(1) hue-rotate(180deg);
        }
    `;

  if (!isLight) {
    addCSS(darkModeCSS);
    const darkModeStyle = document.getElementById("dark-mode-style");
    if (darkModeStyle) return;
    const styleElement = document.head.lastElementChild;
    styleElement.id = "dark-mode-style";
  } else {
    const darkModeStyle = document.getElementById("dark-mode-style");
    darkModeStyle?.parentNode.removeChild(darkModeStyle);
  }
}
