import Button from "@/components/shared/Button";
import { ExplainIcon } from "@features/FirstLoginExperience/ExplainIcon";
import { getIntroJsOptions } from "@features/FirstLoginExperience/config";
import { Icon, Lightbulb } from "@phosphor-icons/react";
import { isServer } from "@studio/config";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { useEffect, useState } from "react";

export const FirstLoginExperience = ({ className }: { className: string }) => {
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

  const onEnd = () => {
    (
      document.getElementsByClassName("sign-in-required")[0] as HTMLElement
    ).style.display = "grid";
    setIsEnabled(false);
  };

  return (
    <>
      <Steps
        initialStep={0}
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
      <div
        className="width-[50px]
           hover:text-accent-foreground rounded-md hover:bg-accent
           flex items-center justify-center cursor-pointer group mr-2 px-3"
        onClick={() => setIsEnabled(true)}
      >
        <div className="flex flex-col items-center">
          <ExplainIcon text={"Explain the app"} Icon={Lightbulb} />
          <strong className="text-[0.5rem]">Tour</strong>
        </div>
      </div>
    </>
  );
};
