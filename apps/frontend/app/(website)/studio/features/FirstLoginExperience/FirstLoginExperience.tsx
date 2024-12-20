import { useTranslation } from "react-i18next";
import { getIntroJsOptions } from "@features/FirstLoginExperience/config";
import { Lightbulb } from "@phosphor-icons/react";
import { IconButton } from "@studio/components/button/IconButton";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { useEffect, useState } from "react";

export const FirstLoginExperience = () => {
const { t } = useTranslation("(website)/studio/features/FirstLoginExperience");

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
      <IconButton
        Icon={Lightbulb}
        text={t('tour')}
        onClick={onStart}
        hint="Explain the app"
      />
    </>
  );
};
