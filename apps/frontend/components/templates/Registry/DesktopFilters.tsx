"use client";

import { cx } from "cva";
import { motion } from "framer-motion";
import FilterSection from "./FilterSection";

import type { RegistryIndexPayload } from "@/types";
import React from "react";
import { useSidebar } from "./context";

export default function DesktopFilters({
  placeholders,
  automationFilters,
  filterIconDictionary,
}: {
  placeholders?: RegistryIndexPayload["placeholders"];
  automationFilters?: RegistryIndexPayload["automationFilters"];
  filterIconDictionary?: RegistryIndexPayload["filterIconDictionary"];
}) {
  let { desktopOpen } = useSidebar();

  let sidebarVariants = {
    open: {
      x: "0%",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      x: "20%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className={cx("scrollbar-color mr-16 hidden w-[290px] lg:flex")}>
      <motion.div
        className={cx(
          "mr-16 flex  max-h-[90vh] w-[290px] flex-col items-start gap-6  pr-2",
          desktopOpen ? "overflow-y-auto" : "overflow-hidden",
        )}
        initial={desktopOpen ? "open" : "closed"}
        animate={desktopOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {automationFilters?.map((section, i, arr) => (
          <React.Fragment key={section.title || `${i}`}>
            <FilterSection
              filterIconDictionary={filterIconDictionary}
              placeholders={placeholders}
              {...section}
            />
            {i === arr.length - 1 && <div className="pb-10" />}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
