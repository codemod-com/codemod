import { TextGenerateEffect } from "@/components/templates/i18nPage/Preview/TextGenerateEffect";
import Cursor from "@/components/templates/i18nPage/Preview/TextGenerateEffect/cursor";
import {
  StepState,
  Steps,
} from "@/components/templates/i18nPage/Preview/types";
import { AnimatePresence } from "framer-motion";
import type React from "react";
import { memo } from "react";

interface PreviewProps {
  step: Steps;
  isAnimating: boolean;
  onStepComplete: () => void;
}

const getStepState = (step: Steps, isAnimating: boolean): StepState => {
  if (step >= Steps.Finish) return StepState.Finished;
  if (step >= Steps.Translating && isAnimating) return StepState.Animated;
  if (step >= Steps.Transforming && isAnimating)
    return StepState.AnimatedCursor;
  if (step >= Steps.Analyzing && isAnimating) return StepState.Detected;
  return StepState.None;
};

const COLORS = [
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#84cc16",
  "#06b6d4",
  "#f43f5e",
];

const translations: Record<string, string> = {
  "Create an account": "Crea una cuenta",
  "Enter your email below to create your account":
    "Ingresa tu correo electrónico abajo para crear tu cuenta",
  "Enter your email...": "Introduce tu correo electrónico...",
  "Sign In with Email": "Inicia sesión con tu correo",
  "Or continue with": "O continúa con",
  GitHub: "GitHub",
  "Don't have an account?": "¿No tienes una cuenta?",
  "Sign up": "Regístrate",
};

const Preview: React.FC<PreviewProps> = ({
  step,
  isAnimating,
  onStepComplete,
}) => {
  const stepState = getStepState(step, isAnimating);

  const renderTextEffect = (
    baseWords: string,
    colorIndex: number,
    extraProps = {},
  ) => (
    <TextGenerateEffect
      key={colorIndex}
      baseWords={baseWords}
      translatedWords={translations[baseWords] || ""}
      duration={1}
      delay={0}
      triggered={stepState > StepState.Animated}
      detected={stepState >= StepState.AnimatedCursor}
      borderColor={COLORS[colorIndex]}
      {...extraProps}
    />
  );

  return (
    <div className="flex h-full bg-white text-black dark:bg-gray-950 dark:text-white">
      <AnimatePresence>
        {stepState >= StepState.Animated && (
          <Cursor onCompleted={onStepComplete} />
        )}
      </AnimatePresence>
      <div className="flex flex-1 flex-col justify-center p-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Header Section */}
          {renderTextEffect("Create an account", 0, {
            as: "h2",
            className: "mb-2 text-center m-heading",
          })}
          {renderTextEffect(
            "Enter your email below to create your account",
            1,
            {
              as: "div",
              className: "mb-4 text-center text-sm opacity-60",
            },
          )}

          {/* Form Section */}
          <form className="space-y-3">
            <div className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:text-white">
              {renderTextEffect("Enter your email...", 2, {
                as: "div",
                className: "opacity-35",
              })}
            </div>
            <div className="w-full rounded bg-black px-3 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-500">
              {renderTextEffect("Sign In with Email", 3, {
                as: "div",
              })}
            </div>
          </form>

          {/* Divider Section */}
          <div className="my-5 flex items-center gap-4 text-center">
            <hr className="flex-1 border border-zinc-400 opacity-20" />
            <span className="text-sm uppercase opacity-50">
              {renderTextEffect("Or continue with", 4, {
                as: "div",
                duration: 1,
              })}
            </span>
            <hr className="flex-1 border border-zinc-400 opacity-20" />
          </div>

          {/* GitHub Button */}
          <button className="flex w-full items-center justify-center gap-2 rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:text-white">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M12 .28v0C5.37.27-.01 5.64-.01 12.27c-.01 5.19 3.34 9.8 8.28 11.41h.29v0c.55.03 1.02-.39 1.06-.94 0-.05 0-.09 0-.13v-.21c0-.17 0-.4 0-1.09v0c-.02-.14-.1-.26-.2-.33v0c-.12-.1-.28-.14-.42-.1 -2.68.58-3.25-1.1-3.29-1.21v0c-.34-.89-.94-1.66-1.72-2.19H3.98c-.05-.05-.1-.08-.15-.11h0c.11-.07.24-.09.38-.07v0c.51.07.94.4 1.15.88v0c.8 1.39 2.57 1.91 4 1.16v0c.14-.07.25-.2.29-.36h0c.03-.47.23-.9.56-1.23h0c.2-.19.22-.5.04-.71 -.09-.1-.2-.15-.32-.17 -2.37-.27-4.79-1.1-4.79-5.19v0c-.02-1.03.35-2.03 1.05-2.78h0c.13-.15.16-.36.09-.53H6.28C6 7.59 6 6.74 6.29 5.97V5.96c.92.16 1.79.55 2.52 1.15v0c.12.08.27.11.42.07v0c.89-.25 1.81-.37 2.74-.37l-.001-.001c.92 0 1.85.12 2.75.37h0c.14.03.29.01.41-.07l0 0c.73-.59 1.59-.99 2.52-1.15v0c.27.76.27 1.61 0 2.38v0c-.08.17-.05.38.09.53v0c.68.74 1.06 1.73 1.05 2.75 0 4.09-2.43 4.91-4.81 5.18v0c-.28.02-.48.27-.45.54 .01.12.07.24.17.33v0c.44.46.67 1.09.61 1.74v3.18 0c-.02.31.12.62.36.83v0c.3.22.69.29 1.06.19v0c6.28-2.11 9.67-8.91 7.57-15.19 -1.64-4.89-6.2-8.18-11.35-8.2Z"
              />
            </svg>
            {renderTextEffect("GitHub", 5, {
              as: "div",
              duration: 1,
            })}
          </button>

          {/* Footer Section */}
          <div className="mt-5 inline-flex flex-wrap justify-center gap-2 text-center text-sm leading-4 opacity-60">
            {renderTextEffect("Don't have an account?", 6, {
              as: "div",
            })}
            <a href="#" className="border-b">
              {renderTextEffect("Sign up", 7, { as: "div" })}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Preview);
