"use client";

import LinkButton from "@/components/shared/LinkButton";
import type { NavigationPayload, SanityLinkType } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLink from "./NavigationLink";

type MobileNavigationProps = {
  items: SanityLinkType[];
  visible: boolean;
  navigationCtas?: NavigationPayload["navigationItems"];
  closeFn: () => void;
};

// Mobile dropdown component
export function MobileDropdown({
  items,
  visible,
  navigationCtas,
  closeFn,
}: MobileNavigationProps) {
  let [currentTheme, setCurrentTheme] = useState("light" as "light" | "dark");
  let isDarkMode = currentTheme === "dark";
  let pathname = usePathname();

  let animationVariants = {
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
    let darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
    let storedTheme = localStorage.getItem("theme") as "light" | "dark";

    let theme = storedTheme || darkMatcher.matches ? "dark" : "light";

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
                <NavigationLink
                  isCurrent={item.href === pathname}
                  onClick={closeFn}
                  className="w-full py-s transition-colors hover:bg-primary-light/5 dark:hover:bg-primary-dark/5"
                  href={item.href}
                >
                  {item.label}
                </NavigationLink>
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
                  <LinkButton
                    key={item._key}
                    className="w-full"
                    href={item?.href}
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
                  </LinkButton>
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
        className="bg-primary-dark first:pt-xxs last:pb-xxs dark:bg-primary-light [&:not(:last-child)]:border-b-[1px] [&:not(:last-child)]:border-b-border-light [&:not(:last-child)]:dark:border-border-dark"
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
