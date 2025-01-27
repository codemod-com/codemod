"use client";

import { useEffect, useRef, useState } from "react";

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
import { useWindowScroll } from "react-use";
import AnnouncementBar from "./AnnouncementBar";

type NavigationProps = {
  data: NavigationPayload;
};

export default function Navigation({ data }: NavigationProps) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const renderMobileMenu = useExitAnimation(mobileMenuOpen);
  const [isStaticHeader, setIsStaticHeader] = useState(
    STATIC_HEADER_ROUTES.includes(pathname),
  );
  const handleTriggerClick = (value: boolean) => {
    setMobileMenuOpen(value);
  };

  const [isBgSolid, setIsBgSolid] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const { y } = useWindowScroll();

  const headerHeight = headerRef.current?.offsetHeight || 0;

  useEffect(() => {
    setMobileMenuOpen(false);
    setIsStaticHeader(STATIC_HEADER_ROUTES.includes(pathname));
  }, [pathname]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
        id={"desktop-navigation"}
        className={cx(
          "left-0 top-0 z-40 w-full border-b-[1px]  transition-all duration-150 ease-out z-10000",
          isStaticHeader ? "absolute" : "fixed",
          {
            "-translate-y-10 opacity-0": !hasMounted,
            "translate-y-0 opacity-100": hasMounted,
          },
          {
            " border-border-light dark:border-border-dark":
              y > 300 && hasMounted,
            " border-transparent": y < 300 && hasMounted,
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
            <DesktopNavigationItems
              items={data?.navigationItems?.map((item) => ({
                ...item,
                isCurrent: item?.href === pathname,
              }))}
            />
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
                      closeFn={() => setMobileMenuOpen(false)}
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
