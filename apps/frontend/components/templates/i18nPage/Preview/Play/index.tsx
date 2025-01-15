"use client";

import { cn } from "@/utils";
import { motion } from "framer-motion";
import { PlayIcon } from "lucide-react";

interface PlayProps {
  className?: string;
  onClick: () => void;
}

export function Play({ className, onClick }: PlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
        <div className="flex size-28 items-center justify-center rounded-full bg-lime-500/10 backdrop-blur-md">
          <div
            className={`relative flex size-20 scale-100 items-center justify-center rounded-full bg-gradient-to-b from-lime-500/30 to-lime-500 shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]`}
          >
            <PlayIcon
              className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
              style={{
                filter:
                  "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
