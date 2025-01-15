"use client";
import { useAnimate } from "framer-motion";
import { useEffect } from "react";
import React from "react";

export const TextGenerateEffect = ({
  baseWords,
  translatedWords,
  as: Wrapper = "p", // Default wrapper component is "p"
  className,
  duration = 0.5,
  delay = 0,
  triggered = false, // Trigger animation as a prop
  detected = false,
  borderColor = "#ff6347", // Default color for the dashed border
}: {
  baseWords: string;
  translatedWords: string;
  as?: React.ElementType; // Component to use as wrapper
  className?: string;
  duration?: number;
  delay?: number; // Time to delay the animation start
  triggered?: boolean; // Trigger for animation
  detected?: boolean; // Detect for animation
  borderColor?: string; // Dashed border color
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const wrapper = scope.current;

    if (wrapper && detected) {
      // Step 1: Detect the words by showing the outline immediately
      animate(
        wrapper,
        { outlineColor: borderColor },
        { duration: 0.5 }, // 500ms for the dashed border fade-in
      );
    }
  }, [detected]); // Run once on component mount

  useEffect(() => {
    if (detected && triggered) {
      const wrapper = scope.current;

      if (wrapper) {
        // Step 2: Proceed with the animation sequence after detection and trigger
        setTimeout(() => {
          // Step 3: Fade out the dashed border and blur the text
          animate(
            wrapper,
            { outline: "none", opacity: 0, filter: "blur(10px)" },
            { duration: duration },
          ).then(() => {
            // Step 4: Replace content with translated words
            wrapper.textContent = translatedWords;

            // Step 5: Fade in the new words
            animate(
              wrapper,
              { opacity: 1, filter: "blur(0px)" },
              { duration: duration },
            );
          });
        }, delay * 1000); // Delay before the fade-out and blur animation starts
      }
    }
  }, [triggered, detected]); // React to changes in `triggered` and `detected`

  return React.createElement(
    Wrapper,
    {
      ref: scope,
      className: `inline-block relative transition-opacity duration-500 ${className}`,
      style: {
        outline: "1px dashed transparent", // Start with no outline
        outlineOffset: "4px",
        opacity: 1, // Fully visible initially
        filter: "blur(0px)", // No blur initially
      },
    },
    baseWords,
  );
};
