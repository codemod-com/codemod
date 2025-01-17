"use client";

import { cn } from "@/utils";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import React, { useState, useEffect } from "react";

export const LanguageSwitchAnimation = ({
  language,
  onLanguageSwitch,
  parentRef,
  animatedCursor,
}: {
  language: string;
  onLanguageSwitch: () => void;
  parentRef: React.RefObject<HTMLDivElement>;
  animatedCursor: boolean;
}) => {
  const x = useMotionValue(0); // Motion value for x-coordinate
  const y = useMotionValue(0); // Motion value for y-coordinate
  const [clicked, setClicked] = useState(false); // Tracks click state for cursor scaling
  const [fadeOut, setFadeOut] = useState(false); // Tracks fade-out state

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();

      // Set random position near center relative to the parent
      const randomOffset = () => Math.random() * 100 - 50; // Random offset
      const centerX = parentRect.width / 2 - randomOffset();
      const centerY = parentRect.height / 2 + randomOffset();
      x.set(centerX);
      y.set(centerY);

      // Move to button bottom center position relative to the parent
      const buttonElement = buttonRef.current;
      if (buttonElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const parentOffsetX = buttonRect.left - parentRect.left;
        const parentOffsetY = buttonRect.top - parentRect.top;

        const buttonBottomCenter = {
          x: parentOffsetX + buttonRect.width / 2 - 13, // Center horizontally
          y: parentOffsetY + buttonRect.height / 2 + 13, // Center vertically
        };

        // Animate x and y to button bottom center
        animate(x, buttonBottomCenter.x, {
          duration: 4,
          ease: "easeInOut",
        });
        animate(y, buttonBottomCenter.y, {
          duration: 4,
          ease: "easeInOut",
          onComplete: () => {
            // Scale up the cursor when reaching the button
            setClicked(true);
            setTimeout(() => {
              setClicked(false); // Reset cursor scale after the animation
              setFadeOut(true); // Trigger fade-out animation
              onLanguageSwitch();
            }, 300);
          },
        });
      }
    }
  }, [parentRef]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <AnimatePresence>
        {/* Animated Cursor */}
        {!fadeOut && (
          <motion.div
            style={{
              x: x, // Bind x motion value
              y: y, // Bind y motion value
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1, // Fade-in cursor
              scale: clicked ? 1.2 : 1, // Scale up when clicked
            }}
            exit={{ opacity: 0 }} // Fade out cursor on unmount
            transition={{
              duration: 1,
              scale: { type: "spring", stiffness: 300, damping: 20 }, // Smooth scaling
            }}
            className={cn(
              "pointer-events-none absolute z-[9999] size-[24px] rounded-full border mix-blend-difference shadow-xl backdrop-blur-lg",
              "border-black/30 bg-black/20 dark:border-white/50 dark:bg-white/50", // Dark mode variants
            )}
          />
        )}
      </AnimatePresence>

      {/* Language Switch Button */}
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        ref={buttonRef}
        className={cn(
          "absolute right-4 top-4 size-12 scale-100 rounded-full border shadow-lg",
          { "scale-95": clicked },
          "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white", // Dark mode variants
        )}
        aria-label="Switch Language"
      >
        {language}
      </button>
    </div>
  );
};

export default function Cursor({
  onCompleted,
  animatedCursor,
}: {
  onCompleted: () => void;
  animatedCursor: boolean;
}) {
  const [language, setLanguage] = useState("🇺🇸");
  const parentRef = React.useRef<HTMLDivElement>(null);

  const handleLanguageSwitch = () => {
    setLanguage((prev) => (prev === "🇺🇸" ? "🇪🇸" : "🇺🇸"));
    onCompleted();
  };

  return (
    <div ref={parentRef} className="absolute inset-0 h-full w-full">
      <LanguageSwitchAnimation
        onLanguageSwitch={handleLanguageSwitch}
        language={language}
        parentRef={parentRef}
        animatedCursor={animatedCursor}
      />
    </div>
  );
}
