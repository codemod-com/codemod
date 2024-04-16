"use client";

import { ThemeProvider } from "@context/useTheme";
import { MainPage } from "@studio/main/index";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { CODEMOD_STUDIO_URL } from "~/constants/urls";

export default function Page() {
	const router = useRouter();
	useEffect(() => {
		router.push(CODEMOD_STUDIO_URL);
	}, [router]);

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
