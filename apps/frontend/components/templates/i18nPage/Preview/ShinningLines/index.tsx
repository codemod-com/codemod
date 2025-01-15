"use client";
import { motion, useInView } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ShiningLinesProps {
  numberOfLines?: number;
}

const ShiningLines: React.FC<ShiningLinesProps> = ({ numberOfLines = 6 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const lines = Array.from({ length: numberOfLines });
  const [shiningLineIndex, setShiningLineIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView) return;

    let previousIndex: number | null = null;

    const interval = setInterval(() => {
      let nextIndex = Math.floor(Math.random() * numberOfLines);
      while (nextIndex === previousIndex) {
        nextIndex = Math.floor(Math.random() * numberOfLines);
      }
      setShiningLineIndex(nextIndex);
      previousIndex = nextIndex;
    }, 3500);

    return () => clearInterval(interval);
  }, [isInView, numberOfLines]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex justify-between pointer-events-none dark:text-white/10 text-black/10 overflow-hidden"
    >
      {lines.map((_, index) => (
        <div key={index} className="relative h-full w-[1px] bg-current">
          {index === shiningLineIndex && (
            <motion.div
              className="absolute w-full h-10 bg-success-light dark:bg-accent"
              initial={{ top: "-100%", scaleY: 0 }}
              animate={{ top: ["-100%", "120%"], scaleY: [0.1, 1.6] }}
              transition={{
                duration: 3,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ShiningLines;
