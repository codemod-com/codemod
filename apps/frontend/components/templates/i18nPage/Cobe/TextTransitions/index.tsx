"use client";

import { LayoutGroup, motion } from "motion/react";
import TextRotate from "../TextRotate";

const TextTransitions = () => {
  return (
    <LayoutGroup>
      <motion.p className="flex flex-wrap" layout>
        <motion.span
          className="pt-0.5 sm:pt-1 md:pt-2 l-heading block w-full"
          layout
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          Go Global, at Lightning Speed{" "}
        </motion.span>
        <TextRotate
          texts={["Effortlessly", "Seamlessly", "Efficiently", "Confidently"]}
          mainClassName="l-heading overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center !font-mono !font-bold"
          staggerFrom={"center"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={4000}
        />
      </motion.p>
    </LayoutGroup>
  );
};

export default TextTransitions;
