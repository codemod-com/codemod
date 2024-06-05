"use client";
import { isServer } from "@studio/config";
import { MainPage } from "@studio/main/index";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

export default function Page() {
  const isDark =
    !isServer && document.documentElement.classList.contains("dark");
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.body.classList.remove("bg-gray-darker", "bg-gray-bg-light");
    document.documentElement.classList.add("light");
  }, [isDark]);
  return (
    <>
      <div className="studio">
        <MainPage />
        <Tooltip
          className="z-50 w-40 bg-gray-light text-center text-xs text-gray-text-dark-title dark:bg-gray-lighter dark:text-gray-text-title "
          delayHide={0}
          delayShow={200}
          id="button-tooltip"
        />
      </div>
      <Toaster />
    </>
  );
}

export const dynamic = "force-dynamic";
