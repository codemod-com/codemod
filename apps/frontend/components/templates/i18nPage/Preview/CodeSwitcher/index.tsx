"use client";

import Scanner from "@/components/templates/i18nPage/Preview/ScannerEffect";
import { Steps } from "@/components/templates/i18nPage/Preview/types";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import LoadingSpinner from "../Spinner";
import { useAnimationControl, useHighlights } from "../hooks";
import { CodeSwitcher } from "./Code";
import JsonHighlighter from "./JSONHighlighter";

interface CodeProps {
  step: Steps;
  setStep: (newStep: Steps | ((prevStep: Steps) => Steps)) => void;
  isAnimating: boolean;
}

const Code: React.FC<CodeProps> = ({ step, setStep, isAnimating }) => {
  const timeline = [500, 1500];
  const [JSXComplete, setJSXComplete] = useState(false);
  const { infos, jsonInfos, loading } = useHighlights();
  const { next } = useAnimationControl(isAnimating);

  const infosLength = infos.length;
  const handleNext = () => {
    next(() => {
      setStep((prevStep) => (prevStep + 1) as Steps);
    });
  };

  useEffect(() => {
    if (isAnimating) {
      let currentTimeout: NodeJS.Timeout | null = null;

      timeline.reduce((acc, delay) => {
        const nextTime = acc + delay;
        currentTimeout = setTimeout(() => {
          handleNext();
        }, nextTime);
        return nextTime; // Accumulate delays
      }, 0);

      return () => {
        if (currentTimeout) clearTimeout(currentTimeout); // Cleanup on unmount or dependency change
      };
    }
  }, [isAnimating]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const index = step >= infosLength ? infosLength - 1 : step;
  const iindex = step - 2;

  return (
    <>
      <AnimatePresence>
        {isAnimating && step === Steps.Analyzing && <Scanner />}
      </AnimatePresence>

      {infos && infos.length > 0 && (
        <motion.div
          initial={false}
          animate={
            step > Steps.Transforming
              ? { height: "60%", marginBottom: "0.25rem" }
              : { height: "100%", marginBottom: 0 }
          }
          transition={{
            duration: 0.8,
          }}
          className="overflow-hidden"
          onAnimationComplete={() => {
            setJSXComplete(true);
          }}
        >
          {infos[index] && <CodeSwitcher info={infos[index]} />}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {JSXComplete && step > Steps.Transforming && (
          <motion.div
            key="json-highlighter"
            className="h-[40%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.75,
            }}
          >
            {jsonInfos && (
              <JsonHighlighter step={step} code={jsonInfos[iindex] || null} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Code;
