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
}: {
  language: string;
  onLanguageSwitch: () => void;
  parentRef: React.RefObject<HTMLDivElement>;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [clicked, setClicked] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const randomOffset = () => Math.random() * 150 + 100;
      const centerX =
        Math.random() < 0.5
          ? randomOffset()
          : parentRect.width - randomOffset();
      const centerY =
        Math.random() < 0.5
          ? randomOffset()
          : parentRect.height - randomOffset();
      x.set(centerX);
      y.set(centerY);

      const buttonElement = buttonRef.current;
      if (buttonElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const parentOffsetX = buttonRect.left - parentRect.left;
        const parentOffsetY = buttonRect.top - parentRect.top;

        const buttonBottomCenter = {
          x: parentOffsetX + buttonRect.width / 2 - 13,
          y: parentOffsetY + buttonRect.height / 2 + 13,
        };

        animate(x, buttonBottomCenter.x, {
          duration: 6,
          ease: "easeInOut",
        });
        animate(y, buttonBottomCenter.y, {
          duration: 6,
          ease: "easeInOut",
          onComplete: () => {
            setClicked(true);
            setTimeout(() => {
              setClicked(false);
              setFadeOut(true);
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
        {!fadeOut && (
          <motion.div
            style={{
              x: x,
              y: y,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: clicked ? 1.2 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              delay: 2,
              scale: { type: "spring", stiffness: 300, damping: 20 },
            }}
            className={cn(
              "pointer-events-none absolute z-[9999] size-[24px] rounded-full border mix-blend-difference shadow-xl backdrop-blur-lg",
              "border-black/30 bg-black/20 dark:border-white/50 dark:bg-white/50",
            )}
          />
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        className={cn(
          "absolute right-4 top-4 size-12 scale-100 rounded-full border shadow-lg",
          { "scale-95": clicked },
          "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white",
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
}: {
  onCompleted: () => void;
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
      />
    </div>
  );
}
