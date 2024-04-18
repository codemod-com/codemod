"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import { useExitAnimation } from "@/hooks/UseExitAnimation";

import {
	DesktopNavigationItems,
	DesktopNavigationRight,
} from "@/components/global/Navigation/DesktopNavigation";
import LogoWithContextMenu from "@/components/global/Navigation/LogoWithContextMenu";
import { MobileDropdown } from "@/components/global/Navigation/MobileNavigation";
import Burger from "@/components/shared/Burger";
import Button from "@/components/shared/Button";
import { STATIC_HEADER_ROUTES } from "@/constants";
import type { NavigationPayload } from "@/types";
import { cx } from "cva";
import { clamp } from "framer-motion";
import { useWindowScroll } from "react-use";
import AnnouncementBar from "./AnnouncementBar";

type NavigationProps = {
	data: NavigationPayload;
};

export default function Navigation({ data }: NavigationProps) {
	const pathname = usePathname();

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const renderMobileMenu = useExitAnimation(mobileMenuOpen);
	const [isStaticHeader, setIsStaticHeader] = useState(
		STATIC_HEADER_ROUTES.includes(pathname),
	);
	const handleTriggerClick = (value: boolean) => {
		setMobileMenuOpen(value);
	};

	const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
	const [isBgSolid, setIsBgSolid] = useState(false);
	const headerRef = useRef<HTMLDivElement>(null);
	const { y } = useWindowScroll();
	const lastYPos = useRef(typeof window !== "undefined" ? window.scrollY : 0);

	const headerHeight = headerRef.current?.offsetHeight || 0;
	const isHeaderFluid = y > headerHeight;

	const animateHeader = useCallback(() => {
		if (headerRef.current) {
			if (isStaticHeader) {
				headerRef.current.style.transform = "translateY(0)";
				headerRef.current.style.transitionDuration = "0ms";

				return;
			}
			if (y > lastYPos.current) {
				headerRef.current.style.transform = `translateY(-${clamp(
					0,
					headerHeight,
					y,
				)}px)`;
				headerRef.current.style.transitionDuration = isHeaderFluid
					? "300ms"
					: "0ms";
				scrollDirection !== "down" && setScrollDirection("down");
			} else {
				headerRef.current.style.transform = "translateY(0)";
				headerRef.current.style.transitionDuration = "200ms";
				scrollDirection !== "up" && setScrollDirection("up");
			}
			lastYPos.current = y;
		}
	}, [y, scrollDirection, isHeaderFluid, headerHeight, isStaticHeader]);

	useEffect(() => {
		if (isStaticHeader) {
			animateHeader();
			return;
		}
		document.addEventListener("scroll", animateHeader);

		return () => {
			document.removeEventListener("scroll", animateHeader);
		};
	}, [animateHeader, isStaticHeader]);

	useEffect(() => {
		setMobileMenuOpen(false);
		if (headerRef.current) {
			animateHeader();
		}
		setIsStaticHeader(STATIC_HEADER_ROUTES.includes(pathname));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	useEffect(() => {
		setIsBgSolid(isStaticHeader ? false : y > headerHeight / 2);
	}, [y, headerHeight, isStaticHeader]);

	return (
		<>
			<div className="absolute left-0 top-0">
				<Toaster
					duration={3000}
					toastOptions={{
						unstyled: true,
						classNames: {
							toast:
								"bg-primary-dark dark:bg-primary-light font-medium body-s-medium p-s rounded-[8px] shadow-sm dark:shadow-none border-[1px] border-border-light dark:border-border-dark",
							title: "text-primary-light dark:text-primary-dark",
						},
					}}
				/>
			</div>

			<div
				ref={headerRef}
				className={cx(
					"left-0 top-0 z-40 w-full border-b-[1px] border-transparent transition-all duration-0",
					// isStaticHeader ? "absolute" : "fixed", // this makes the top bar menu items unclickable
					{
						" border-border-light dark:border-border-dark":
							y > headerHeight + 10,
						"bg-white dark:bg-background-dark": isBgSolid,
					},
				)}
			>
				{/* Toast for context menu */}

				<div>
					{/* Announcement Bar */}
					{data?.announcementBar?.enabled && (
						<AnnouncementBar data={data?.announcementBar} />
					)}
					<div
						className={cx(
							"mx-auto flex w-full max-w-[1312px] items-center justify-between px-m py-s transition-all duration-300 ease-out lg:px-xxxl lg:py-[20px]",
							renderMobileMenu &&
								"relative z-50 bg-primary-dark dark:bg-primary-light",
						)}
					>
						<LogoWithContextMenu />

						{/* Desktop */}
						<DesktopNavigationItems items={data?.navigationItems} />
						<DesktopNavigationRight items={data?.navigationCtas} />
						{/* Mobile */}
						<div className="flex items-center gap-3 lg:hidden">
							<DropdownMenu.Root
								onOpenChange={handleTriggerClick}
								open={renderMobileMenu}
							>
								<DropdownMenu.Trigger asChild>
									<Button intent="secondary-icon-only" flush>
										<Burger open={mobileMenuOpen} />
									</Button>
								</DropdownMenu.Trigger>

								<DropdownMenu.Portal>
									<DropdownMenu.Content
										align="start"
										className="z-[99] h-screen bg-primary-dark/25 backdrop-blur-md transition-all duration-300 ease-out dark:bg-primary-light/25"
										sideOffset={0}
										side="bottom"
										onCloseAutoFocus={(event) => {
											event.preventDefault();
										}}
									>
										<MobileDropdown
											items={data?.navigationItems}
											visible={mobileMenuOpen}
											navigationCtas={data?.navigationCtas}
										/>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
