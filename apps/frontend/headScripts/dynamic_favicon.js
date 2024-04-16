const dynamic_favicon = `const favicon = document.querySelector('link[rel="icon"]')

document.addEventListener("visibilitychange", () => {
  
    const state = document.hidden ? "-inactive" : "";


    var storedTheme = localStorage.getItem("theme");
    var prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = "-" + ((prefersDarkMode ? "dark" : "light") || storedTheme);

      if (state) {
        favicon.setAttribute("href", "favicon" + state + theme + ".ico")
      } else {
        favicon.setAttribute("href", "favicon.ico")
      }
    })`;

export default dynamic_favicon;
