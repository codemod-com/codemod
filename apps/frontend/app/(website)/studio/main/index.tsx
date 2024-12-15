"use client";
import { useTranslation } from "react-i18next";


import { Label } from "@studio/components/ui/label";
import New5PaneSetup from "./5PaneSetup";

export const MainPage = () => {
const { t } = useTranslation("../(website)/studio/main");

  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
      navigator.userAgent,
    );

  if (isMobile) {
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center p-7">
        <Label className="text-center font-light leading-5">{t('codemod-studio-desktop-usage')}</Label>
        <Label className="mb-5 text-center font-light leading-5">{t('codemod-studio-demo-video')}</Label>
        <video
          className="rounded-sm"
          width="320"
          height="40%"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://github.com/codemod-com/codemod/raw/main/apps/docs/images/codemod-studio/codemod-studio-quickstart.mp4"
            type="video/mp4"
          />{t('browser-video-tag-support')}</video>
      </div>
    );
  }

  return <New5PaneSetup />;
};
