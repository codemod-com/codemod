const themeScript = `!(function () {
  try {
    var documentElement = document.documentElement,
      classList = documentElement.classList;
    // Remove any existing theme classes
    classList.remove("light", "dark");

    // Retrieve the stored theme preference
    var storedTheme = localStorage.getItem("theme");
    var prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var prefersLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (prefersDarkMode || prefersLightMode) {

      // Add theme class based on system preference
      if (prefersDarkMode) {
        classList.add("dark");
      } else {
        classList.add("light");
      }
    } else if(storedTheme) {
      // Map 'light' and 'dark' to corresponding theme classes
      var themeMapping = {
        light: "light",
        dark: "dark",
      };

      // Add selected theme to the class list
      classList.add(themeMapping[storedTheme] || "");
    }
  } catch (e) {
    console.error(e);
  }
  })();`;

export default themeScript;
