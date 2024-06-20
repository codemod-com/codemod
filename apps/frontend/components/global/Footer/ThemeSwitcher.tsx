"use client";

import Icon from "@/components/shared/Icon";
import { useTheme } from "@/hooks/useTheme";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  let { setTheme } = useTheme();
  let [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  function toggleTheme() {
    let newTheme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(newTheme);
    setTheme(newTheme, true);
  }

  useEffect(() => {
    let darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
    let storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    setCurrentTheme(storedTheme || darkMatcher.matches ? "dark" : "light");
    darkMatcher.onchange = () => {
      if (storedTheme) return;
      let _theme = storedTheme || darkMatcher.matches ? "dark" : "light";
      setCurrentTheme(_theme);
      setTheme(_theme);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let darkVariants = {
    initial: { x: "-200%", y: "60%" },
    animate:
      currentTheme === "dark"
        ? { x: "-50%", y: "0%" }
        : { x: "-200%", y: "60%" },
  };

  let lightVariants = {
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
