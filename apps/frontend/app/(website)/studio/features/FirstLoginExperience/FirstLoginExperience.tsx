import { ExplainIcon } from "@features/FirstLoginExperience/ExplainIcon";
import { getIntroJsOptions } from "@features/FirstLoginExperience/config";
import { Lightbulb } from "@phosphor-icons/react";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { useEffect, useState } from "react";

export const FirstLoginExperience = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const onStart = () => {
    setIsEnabled(true);
    const signInRequired = document.getElementsByClassName(
      "sign-in-required",
    )[0] as HTMLElement;
    if (signInRequired) signInRequired.style.display = "none";
  };
  useEffect(() => {
    const isFirstTimeUser = !localStorage.getItem("returningUser");
    localStorage?.setItem("returningUser", "true");
    if (isFirstTimeUser) {
      sessionStorage.setItem("isFirstTime", "true");
      setTimeout(onStart, 4000);
    }
  }, []);

  const onEnd = () => {
    const signInRequired = document.getElementsByClassName(
      "sign-in-required",
    )[0] as HTMLElement;
    if (signInRequired) signInRequired.style.display = "grid";
    setIsEnabled(false);
  };

  return (
    <>
      <Steps
        initialStep={0}
        enabled={isEnabled}
        onComplete={onEnd}
        onExit={onEnd}
        showStepNumbers={true}
        options={{
          nextLabel: "Next",
          prevLabel: "Back",
          doneLabel: "Start your adventure!",
        }}
        steps={getIntroJsOptions().steps}
      />
      <div
        className="width-[50px]
           hover:text-accent-foreground rounded-md hover:bg-accent
           flex items-center justify-center cursor-pointer group mr-2 px-3"
        onClick={onStart}
      >
        <div className="flex flex-col items-center">
          <ExplainIcon text={"Explain the app"} Icon={Lightbulb} />
          <strong className="text-[0.5rem]">Tour</strong>
        </div>
      </div>
    </>
  );
};
