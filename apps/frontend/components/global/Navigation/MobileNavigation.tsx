"use client";

import Button from "@/components/shared/Button";
import type { NavigationPayload, SanityLinkType } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import NavigationLink from "./NavigationLink";

type MobileNavigationProps = {
	items: SanityLinkType[];
	visible: boolean;
	navigationCtas?: NavigationPayload["navigationItems"];
};

// Mobile dropdown component
export function MobileDropdown({
	items,
	visible,
	navigationCtas,
}: MobileNavigationProps) {
	const [currentTheme, setCurrentTheme] = useState("light" as "light" | "dark");
	const isDarkMode = currentTheme === "dark";

	const animationVariants = {
		initial: {
			opacity: 0,
			y: -4,
		},
		animate: (index: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				delay: 0.042 * index,
			},
		}),
		exit: {
			opacity: 0,
			y: -4,
		},
	};

	useEffect(() => {
		const theme = localStorage.getItem("theme") as "light" | "dark";
		setCurrentTheme(theme);
	}, []);

	return (
		<div className="z-[100] flex w-screen max-w-full flex-col bg-primary-dark px-m pb-s pt-m dark:bg-primary-light">
			<AnimatePresence>
				{visible && (
					<>
						{items?.map((item, index) => (
							<MobileDropdownItem
								key={item.href}
								animationVariants={animationVariants}
								index={index}
							>
								<NavigationLink href={item.href}>{item.label}</NavigationLink>
							</MobileDropdownItem>
						))}

						<motion.div
							className="flex gap-s pt-m"
							variants={animationVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							custom={6}
						>
							{navigationCtas
								?.map((item, index) => (
									<NavigationLink
										className="flex-1"
										key={item._key}
										href={item?.href}
									>
										<Button
											className="w-full"
											glow={index === 0 && isDarkMode}
											intent={
												isDarkMode
													? "secondary"
													: index === 0
														? "primary"
														: "secondary"
											}
										>
											{item?.label}
										</Button>
									</NavigationLink>
								))

								.reverse()}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

function MobileDropdownItem({
	children,
	index,
	animationVariants,
}: {
	children: React.ReactNode;
	index: number;
	animationVariants?: any;
}) {
	return (
		<DropdownMenu.Item asChild>
			<motion.div
				className="bg-primary-dark py-s first:pt-xxs last:pb-xxs dark:bg-primary-light [&:not(:last-child)]:border-b-[1px] [&:not(:last-child)]:border-b-border-light [&:not(:last-child)]:dark:border-border-dark"
				variants={animationVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				custom={index}
			>
				{children}
			</motion.div>
		</DropdownMenu.Item>
	);
}
