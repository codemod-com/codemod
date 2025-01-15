import { cn } from "@/utils";
import { motion } from "framer-motion";
import type { ComponentProps } from "react";

export default function Step({
  step,
  title,
  currentStep,
}: {
  step: number;
  title: string;
  currentStep: number;
}) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  return (
    <motion.div animate={status} className="flex items-center gap-3">
      <motion.div className="relative">
        <motion.div
          variants={{
            active: {
              scale: 1,
              transition: {
                delay: 0,
                duration: 0.2,
              },
            },
            complete: {
              scale: 1.25,
            },
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "tween",
            ease: "circOut",
          }}
          className="absolute inset-0 rounded-full"
        />

        <motion.div
          initial={false}
          variants={{
            inactive: {
              opacity: 0.5,
            },
            active: {
              opacity: 1,
            },
            complete: {
              opacity: 1,
            },
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-full border-2",
            status === "inactive"
              ? "border-foreground text-foreground"
              : "dark:border-accent dark:text-accent border-success-light text-success-light",
          )}
        >
          <div className="flex items-center justify-center">
            {status === "complete" ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : (
              <span>
                <i className={cn("block h-2 w-2 rounded-full bg-current")} />
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        initial={false}
        className="font-bold"
        variants={{
          inactive: {
            opacity: 0.4,
          },
          active: {
            opacity: 1,
          },
          complete: {
            opacity: 1,
          },
        }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.div>
    </motion.div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
