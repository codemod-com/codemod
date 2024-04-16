"use client";

import Icon from "@/components/shared/Icon";
import { useTheme } from "@/hooks/useTheme";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
	const { setTheme } = useTheme();
	const [currentTheme, setCurrentTheme] = useState("light" as "light" | "dark");

	function toggleTheme() {
		const newTheme = currentTheme === "dark" ? "light" : "dark";
		setCurrentTheme(newTheme);
		setTheme(newTheme);
	}

	useEffect(() => {
		const theme = localStorage.getItem("theme") as "light" | "dark";

		const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";

		setCurrentTheme(defaultTheme);
		localStorage.setItem("theme", defaultTheme);
	}, []);

	const darkVariants = {
		initial: { x: "-200%", y: "60%" },
		animate:
			currentTheme === "dark"
				? { x: "-50%", y: "0%" }
				: { x: "-200%", y: "60%" },
	};

	const lightVariants = {
		initial: { x: "200%", y: "60%" },
		animate:
			currentTheme === "light"
				? { x: "-50%", y: "0%" }
				: { x: "200%", y: "60%" },
	};

	return (
		<button
			className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[8px] border-[1px] border-border-light transition-colors hover:bg-accent"
			aria-label="Switch theme"
			onClick={toggleTheme}
		>
			<motion.div
				variants={darkVariants}
				initial="initial"
				animate="animate"
				transition={{
					type: "spring",
					duration: 0.4,
					bounce: 0.33,
				}}
				className={cx("absolute left-1/2 ")}
			>
				<Icon name="moon" />
			</motion.div>
			<motion.div
				variants={lightVariants}
				initial="initial"
				animate="animate"
				transition={{
					type: "spring",
					duration: 0.4,
					bounce: 0.33,
				}}
				className={cx("absolute left-1/2 ")}
			>
				<Icon name="sun" />
			</motion.div>
		</button>
	);
}
