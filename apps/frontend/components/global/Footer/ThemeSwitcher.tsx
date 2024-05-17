"use client";

import Icon from "@/components/shared/Icon";
import { useTheme } from "@/hooks/useTheme";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  let { toggleTheme, theme } = useTheme();

  let darkVariants = {
    initial: { x: "-200%", y: "60%" },
    animate:
      theme === "dark" ? { x: "-50%", y: "0%" } : { x: "-200%", y: "60%" },
  };

  let lightVariants = {
    initial: { x: "200%", y: "60%" },
    animate:
      theme === "light" ? { x: "-50%", y: "0%" } : { x: "200%", y: "60%" },
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
