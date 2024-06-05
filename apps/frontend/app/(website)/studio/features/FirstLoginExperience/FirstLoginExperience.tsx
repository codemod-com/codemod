import { getIntroJsOptions } from "@features/FirstLoginExperience/config";
import { isServer } from "@studio/config";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { useEffect, useState } from "react";

export const FirstLoginExperience = () => {
  const isIntro =
    !isServer && !!document.getElementsByClassName("introjs-helperLayer")[0];
  const [isEnebaled, setIsEnabled] = useState(false);
  useEffect(() => {
    const isFirstTimeUser = !localStorage.getItem("returningUser");
    localStorage?.setItem("returningUser", "true");
    if (isFirstTimeUser) {
      sessionStorage.setItem("isFirstTime", "true");
      setTimeout(() => {
        setIsEnabled(true);
        (
          document.getElementsByClassName("sign-in-required")[0] as HTMLElement
        ).style.display = "none";
      }, 4000);
    }
  }, [isIntro]);

  const onStart = () => {
    console.log(
      "start",
      document.getElementsByClassName("sign-in-required")[0],
    );
  };
  const onEnd = () => {
    (
      document.getElementsByClassName("sign-in-required")[0] as HTMLElement
    ).style.display = "grid";
  };

  return (
    <Steps
      initialStep={0}
      onStart={onStart}
      enabled={isEnebaled}
      onComplete={onEnd}
      showStepNumbers={true}
      options={{
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Start your adventure!",
      }}
      steps={getIntroJsOptions().steps}
      onExit={onEnd}
    />
  );
};
