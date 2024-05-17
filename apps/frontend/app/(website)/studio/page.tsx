"use client";

import { MainPage } from "@studio/main/index";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

export default function Page() {
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

export let dynamic = "force-dynamic";
