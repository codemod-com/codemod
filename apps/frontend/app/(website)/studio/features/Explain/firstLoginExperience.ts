import { getIntroJsOptions } from "@features/Explain/config";
import introJs from "intro.js";
import "intro.js/introjs.css";

const isFirstTimeUser = !localStorage.getItem("returningUser");
localStorage.setItem("returningUser", "true");

if (isFirstTimeUser) {
  sessionStorage.setItem("isFirstTime", "true");
  setTimeout(() => {
    introJs().setOptions(getIntroJsOptions()).start();
  }, 4000);
}
