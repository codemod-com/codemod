"use client";
import Preview from "@/components/templates/i18nPage/Preview";
import Code from "@/components/templates/i18nPage/Preview/CodeSwitcher";
import { Play } from "@/components/templates/i18nPage/Preview/Play";
import TaskCard from "@/components/templates/i18nPage/Preview/Step/TaskCard";
import { Steps } from "@/components/templates/i18nPage/Preview/types";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function DemoSection() {
  const [step, setStep] = useState<Steps>(Steps.Analyzing);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleAnimationReset = () => {
    setResetKey((prevKey) => prevKey + 1);
    setStep(Steps.Analyzing);
    setIsAnimating(true);
  };

  const handleStepComplete = () => {
    setStep(Steps.Finish);
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  return (
    <>
      <div className="relative z-[60] w-full max-w-full">
        <aside className="sticky top-10 z-[200] md:absolute md:-bottom-14 md:-right-0 md:top-auto md:w-72 border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
          <TaskCard key={`TaskCard-${resetKey}`} step={step} />
        </aside>

        <main
          key={`Timeline-${resetKey}`} // Force re-mount of the main component
          className="relative flex flex-col gap-1 max-w-[1152px] shadow-2xl overflow-hidden rounded-[6px] border border-border-light bg-zinc-200 p-1 mx-auto md:h-[500px] md:flex-row dark:bg-gray-950 dark:border-border-dark"
        >
          <AnimatePresence>
            {!isAnimating && (
              <Play
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 transition-colors hover:bg-white/10 dark:hover:bg-gray-950/10 dark:bg-gray-950/20"
                onClick={handleAnimationReset}
              />
            )}
          </AnimatePresence>
          <div className="relative order-2 flex flex-col overflow-hidden rounded-l md:order-1 md:w-[40%]">
            <Code
              key={`Code-${resetKey}`}
              step={step}
              isAnimating={isAnimating}
              setStep={setStep}
            />
          </div>

          <div className="pointer-events-none relative order-1 flex-1 select-none overflow-hidden rounded-r">
            <Preview
              key={`Preview-${resetKey}`}
              step={step}
              isAnimating={isAnimating}
              onStepComplete={handleStepComplete}
            />
          </div>
        </main>
      </div>
    </>
  );
}
