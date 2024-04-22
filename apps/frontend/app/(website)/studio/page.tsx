"use client";

import { ThemeProvider } from "@context/useTheme";
import { MainPage } from "@studio/main/index";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

export default function Page() {
	return (
		<ThemeProvider>
			<MainPage />
			<Tooltip
				className="z-50 w-40 bg-gray-light text-center text-xs text-gray-text-dark-title dark:bg-gray-lighter dark:text-gray-text-title "
				delayHide={0}
				delayShow={200}
				id="button-tooltip"
			/>
			<Toaster />
		</ThemeProvider>
	);
}

export const dynamic = "force-dynamic";
