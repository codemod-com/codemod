"use client";

import { cn } from "@/utils";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  suffix = "",
}: {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // delay in seconds
  decimalPlaces?: number;
  suffix?: string; // suffix text
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)))}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springValue, decimalPlaces, suffix]);

  return (
    <span
      className={cn(
        "inline-block tabular-nums tracking-wider text-black dark:text-white",
        className,
      )}
      ref={ref}
    />
  );
}
