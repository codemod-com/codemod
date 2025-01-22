"use client";

import Scanner from "@/components/templates/i18nPage/Preview/ScannerEffect";
import { Steps } from "@/components/templates/i18nPage/Preview/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingSpinner from "../Spinner";
import { useHighlights } from "../hooks";
import { CodeSwitcher } from "./Code";
import JsonHighlighter from "./JSONHighlighter";

interface CodeProps {
  step: Steps;
  setStep: (newStep: Steps | ((prevStep: Steps) => Steps)) => void;
  isAnimating: boolean;
}

const DELAYS = [0, 2000, 2000];
const Code = ({ step, setStep, isAnimating }: CodeProps) => {
  const [JSXComplete, setJSXComplete] = useState(false);
  const { infos, jsonInfos, loading } = useHighlights();
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const handleNext = useCallback(() => {
    if (!isAnimating) return;
    const step = stepRef.current;

    setTimeout(() => {
      setStep((prevStep) => Math.min(prevStep + 1, 3));
    }, DELAYS[step]);
  }, [isAnimating, setStep]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const jsxIndex = Math.min(step, 2);
  const jsonIndex = step >= 3 ? 1 : 0;

  return (
    <>
      <AnimatePresence>
        {isAnimating && step === Steps.Analyzing && (
          <Scanner onComplete={handleNext} />
        )}
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
          {infos[jsxIndex] && <CodeSwitcher info={infos[jsxIndex]} />}
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
              <JsonHighlighter
                step={step}
                code={jsonInfos[jsonIndex] || null}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Code;
